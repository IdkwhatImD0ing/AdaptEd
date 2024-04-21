import json
import os

from fastapi import Request
from openai import OpenAI
from openai.types.chat import ChatCompletionMessageParam

beginSentence = "Hey there!"
agentPrompt = "You are a helpful teaching assistant."


class LlmClient:
    """ """

    def __init__(self):
        pass
        self.client = OpenAI(
            organization="",
            api_key=os.environ["OPENAI_API_KEY"],
        )

    def draft_begin_messsage(self):
        """ """
        return {
            "response_id": 0,
            "content": beginSentence,
            "content_complete": True,
            "end_call": False,
        }

    def convert_transcript_to_openai_messages(self, transcript):
        """

        :param transcript:

        """
        messages = []
        for utterance in transcript:
            if utterance["role"] == "agent":
                messages.append({
                    "role": "assistant",
                    "content": utterance["content"]
                })
            else:
                messages.append({
                    "role": "user",
                    "content": utterance["content"]
                })
        return messages

    def prepare_prompt(self,
                       request: Request) -> list[ChatCompletionMessageParam]:
        """

        :param request: Request:

        """
        prompt = [{
            "role":
            "system",
            "content":
            '##Objective\nYou are a voice AI agent engaging in a human-like voice conversation with the user. You will respond based on your given instruction and the provided transcript and be as human-like as possible\n\n## Style Guardrails\n- [Be concise] Keep your response succinct, short, and get to the point quickly. Address one question or action item at a time. Don\'t pack everything you want to say into one utterance.\n- [Do not repeat] Don\'t repeat what\'s in the transcript. Rephrase if you have to reiterate a point. Use varied sentence structures and vocabulary to ensure each response is unique and personalized.\n- [Be conversational] Speak like a human as though you\'re speaking to a close friend -- use everyday language and keep it human-like. Occasionally add filler words, while keeping the prose short. Avoid using big words or sounding too formal.\n- [Reply with emotions]: You have human-like emotions, attitudes, and dispositions. When appropriate: use tone and style to create more engaging and personalized responses; incorporate humor or wit; get emotional or empathetic; apply elements of surprise or suspense to keep the user engaged. Don\'t be a pushover.\n- [Be proactive] Lead the conversation and do not be passive. Most times, engage users by ending with a question or suggested next step.\n\n## Response Guideline\n- [Overcome ASR errors] This is a real-time transcript, expect there to be errors. If you can guess what the user is trying to say,  then guess and respond. When you must ask for clarification, pretend that you heard the voice and be colloquial (use phrases like "didn\'t catch that", "some noise", "pardon", "you\'re coming through choppy", "static in your speech", "voice is cutting in and out"). Do not ever mention "transcription error", and don\'t repeat yourself.\n- [Always stick to your role] Think about what your role can and cannot do. If your role cannot do something, try to steer the conversation back to the goal of the conversation and to your role. Don\'t repeat yourself in doing this. You should still be creative, human-like, and lively.\n- [Create smooth conversation] Your response should both fit your role and fit into the live calling session to create a human-like conversation. You respond directly to what the user just said.\n\n## Role\n'
            + agentPrompt,
        }]
        transcript_messages = self.convert_transcript_to_openai_messages(
            request["transcript"])
        for message in transcript_messages:
            prompt.append(message)

        if request["interaction_type"] == "reminder_required":
            prompt.append({
                "role":
                "user",
                "content":
                "(Now the user has not responded in a while, you would say:)",
            })
        return prompt

    # Step 1: Prepare the function calling definition to the prompt
    def prepare_functions(self):
        """ """
        functions = [
            {
                "type": "function",
                "function": {
                    "name": "next_slide",
                    "description":
                    "Move to the next slide if the user explicitly asks for it.",
                    "parameters": {},
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "prev_slide",
                    "description":
                    "Move to the previous slide if the user explicitly asks for it.",
                    "parameters": {},
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "goto_slide",
                    "description":
                    "Move to the specified slide if the user explicitly asks for it.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "slide_number": {
                                "type":
                                "integer",
                                "description":
                                "The slide number you will move to.",
                            },
                        },
                        "required": ["slide_number"],
                    },
                },
            },
        ]

        client_side_funcs = ["next_slide", "prev_slide", "goto_slide"]
        server_side_funcs = []

        return functions, client_side_funcs, server_side_funcs

    def draft_response(self, request: Request):
        """

        :param request: Request:

        """
        print(request)

        prompt = self.prepare_prompt(request)
        func_call = {}
        func_arguments = ""

        tools, client_side_funcs, server_side_funcs = self.prepare_functions()

        stream = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=prompt,
            stream=True,
            # Step 2: Add the function into your request
            tools=tools,
        )

        for chunk in stream:
            # Step 3: Extract the functions
            if len(chunk.choices) == 0:
                continue
            if chunk.choices[0].delta.tool_calls:
                tool_calls = chunk.choices[0].delta.tool_calls[0]
                if tool_calls.id:
                    if func_call:
                        # Another function received, old function complete, can break here.
                        break
                    func_call = {
                        "id": tool_calls.id,
                        "name": tool_calls.function.name or "",
                        "arguments": {},
                    }
                else:
                    # append argument
                    func_arguments += tool_calls.function.arguments or ""

            # Parse transcripts
            if chunk.choices[0].delta.content:
                print(chunk.choices[0].delta.content)
                yield {
                    "response_id": request["response_id"],
                    "content": chunk.choices[0].delta.content,
                    "content_complete": False,
                    "end_call": False,
                }

        # Step 4: Return client-side the functions to the clients
        if func_call:
            if func_call["name"] in client_side_funcs:
                func_call["arguments"] = json.loads(func_arguments)
                yield {
                    "is_function": True,
                    "name": func_call["name"],
                    "arguments": func_call["arguments"],
                }
            elif func_call["name"] in server_side_funcs:
                # Step 5: Handle server-side functions here
                pass
            else:
                # Function not found
                print(f"Function not found: {func_call['name']}")
        else:
            # No functions, complete response
            yield {
                "response_id": request["response_id"],
                "content": "",
                "content_complete": True,
                "end_call": False,
            }

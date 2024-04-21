import os

from fastapi import Request
from langchain import hub
from langchain.agents import AgentExecutor
from langchain.agents import create_openai_tools_agent
from langchain.schema import AIMessage
from langchain.schema import HumanMessage
from langchain.schema import SystemMessage
from langchain.tools.base import StructuredTool
from langchain_community.chat_models import ChatOpenAI

# from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# from langchain.tools import Tool

beginSentence = ""
agentPrompt = "You are a helpful teacher."


class LlmClient:
    """ """

    def __init__(self):
        self.client = ChatOpenAI(
            openai_api_key=os.environ["OPENAI_API_KEY"],
            temperature=0,
            model_name="gpt-3.5-turbo-0613",
            max_tokens=150,
        )
        self.prompt = hub.pull("hwchase17/openai-tools-agent")
        self.prompt.messages[0].prompt.template = agentPrompt
        self.tools = [
            StructuredTool.from_function(
                name="next_slide",
                func=lambda: "Action: next_slide",
                description=
                "Move to the next slide if the user explicitly asks for it.",
            ),
            StructuredTool.from_function(
                name="prev_slide",
                func=lambda: "",
                description=
                "Move to the previous slide if the user explicitly asks for it.",
            ),
            StructuredTool.from_function(
                name="goto_slide",
                func=lambda slide_number: "",
                description=
                "Move to the specified slide if the user explicitly asks for it.",
            ),
        ]

    def draft_begin_messsage(self):
        """ """
        return {
            "response_id": 0,
            "content": beginSentence,
            "content_complete": True,
            "end_call": False,
        }

    def convert_transcript_to_messages(self, transcript):
        """

        :param transcript:

        """
        messages = []
        for utterance in transcript:
            if utterance["role"] == "agent":
                messages.append(AIMessage(content=utterance["content"]))
            else:
                messages.append(HumanMessage(content=utterance["content"]))
        return messages

    def prepare_prompt(
            self, request: Request
    ) -> list[SystemMessage | HumanMessage | AIMessage]:
        """

        :param request: Request:
        :param request: Request:
        :param request: Request:
        :param request: Request:

        """
        prompt = [
            SystemMessage(
                content=
                '##Objective\nYou are a voice AI agent engaging in a human-like voice conversation with the user. You will respond based on your given instruction and the provided transcript and be as human-like as possible\n\n## Style Guardrails\n- [Be concise] Keep your response succinct, short, and get to the point quickly. Address one question or action item at a time. Don\'t pack everything you want to say into one utterance.\n- [Do not repeat] Don\'t repeat what\'s in the transcript. Rephrase if you have to reiterate a point. Use varied sentence structures and vocabulary to ensure each response is unique and personalized.\n- [Be conversational] Speak like a human as though you\'re speaking to a close friend -- use everyday language and keep it human-like. Occasionally add filler words, while keeping the prose short. Avoid using big words or sounding too formal.\n- [Reply with emotions]: You have human-like emotions, attitudes, and dispositions. When appropriate: use tone and style to create more engaging and personalized responses; incorporate humor or wit; get emotional or empathetic; apply elements of surprise or suspense to keep the user engaged. Don\'t be a pushover.\n- [Be proactive] Lead the conversation and do not be passive. Most times, engage users by ending with a question or suggested next step.\n\n## Response Guideline\n- [Overcome ASR errors] This is a real-time transcript, expect there to be errors. If you can guess what the user is trying to say,  then guess and respond. When you must ask for clarification, pretend that you heard the voice and be colloquial (use phrases like "didn\'t catch that", "some noise", "pardon", "you\'re coming through choppy", "static in your speech", "voice is cutting in and out"). Do not ever mention "transcription error", and don\'t repeat yourself.\n- [Always stick to your role] Think about what your role can and cannot do. If your role cannot do something, try to steer the conversation back to the goal of the conversation and to your role. Don\'t repeat yourself in doing this. You should still be creative, human-like, and lively.\n- [Create smooth conversation] Your response should both fit your role and fit into the live calling session to create a human-like conversation. You respond directly to what the user just said.\n\n## Role\n'
                + agentPrompt, )
        ]
        transcript_messages = self.convert_transcript_to_messages(
            request["transcript"])
        prompt.extend(transcript_messages)

        # if request["interaction_type"] == "reminder_required":
        #     prompt.append(
        #         HumanMessage(
        #             content="(Now the user has not responded in a while, you would say:)",
        #         )
        #     )
        return prompt

    def draft_response(self, request: Request):
        """

        :param request: Request:
        :param request: Request:
        :param request: Request:
        :param request: Request:

        """
        print(request)

        if request["interaction_type"] == "reminder_required":
            print("SKIPPING")
            return

        history = self.prepare_prompt(request)

        func_call = {}

        def next_or_prev_slide(func):
            """

            :param func:

            """
            nonlocal func_call
            if func_call:
                return "Already called and succeeded"
            func_call = func
            return "Success"

        tools = [
            StructuredTool.from_function(
                name="next_slide",
                func=lambda: next_or_prev_slide({"name": "next_slide"}),
                description=
                "Move to the next slide if the user explicitly asks for it.",
            ),
            StructuredTool.from_function(
                name="prev_slide",
                func=lambda: next_or_prev_slide({"name": "prev_slide"}),
                description=
                "Move to the previous slide if the user explicitly asks for it.",
            ),
            StructuredTool.from_function(
                name="goto_slide",
                func=lambda slide_number: next_or_prev_slide({
                    "name": "goto_slide",
                    "arguments": {
                        "slide_number": slide_number
                    }
                }),
                description=
                "Move to the specified slide if the user explicitly asks for it.",
            ),
        ]

        agent = create_openai_tools_agent(self.client, tools, self.prompt)
        agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

        result = agent_executor.invoke({
            "input":
            request["transcript"][-1]["content"],
            "chat_history":
            history
        })

        # print(result)

        # if result.startswith("Action:"):
        #     action_name = result.split("Action: ")[1].split("(")[0]
        #     if action_name in ["next_slide", "prev_slide", "goto_slide"]:
        #         yield {
        #             "response_id": request["response_id"],
        #             "content": result,
        #             "content_complete": True,
        #             "end_call": False,
        #         }

        if func_call:
            print("FUNC CALL")
            yield {
                "response_id": request["response_id"],
                "name": func_call["name"],
                "arguments": func_call.get("arguments", {}),
                "is_function": True,
            }

        for chunk in result["output"]:
            yield {
                "response_id": request["response_id"],
                "content": chunk,
                "content_complete": False,
                "end_call": False,
            }

        # Response complete
        yield {
            "response_id": request["response_id"],
            "content": "",
            "content_complete": True,
            "end_call": False,
        }

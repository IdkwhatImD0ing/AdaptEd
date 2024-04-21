from uagents import Agent, Bureau, Context, Model
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain.agents import AgentType, Tool, AgentExecutor, create_tool_calling_agent
from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain import hub
from langchain_openai import ChatOpenAI
from langchain.tools import tool
from typing import List, Dict, Any
from openai import AsyncOpenAI

search = GoogleSerperAPIWrapper()

search = GoogleSerperAPIWrapper()
google_search = Tool(
    name="google_search",
    func=search.results,
    description="Searches Google for the input query",
)

agent_prompt = """
You are agent in charge of finding reference links from google for a given topic.
You are a lecture assistant, make sure to find one or two links that are relevant to the topic.
"""


class Message(Model):
    topic: str


google = Agent(name="google", seed="google seed")


@google.on_message(model=Message)
async def google_message_handler(ctx: Context, sender: str, msg: Message):
    prompt = hub.pull("hwchase17/openai-tools-agent")
    prompt.messages[0].prompt.template = agent_prompt
    llm = ChatOpenAI(temperature=0, model_name="gpt-4-turbo")
    tools = [
        google_search,
    ]

    agent = create_tool_calling_agent(llm, tools, prompt)
    executor = AgentExecutor(agent=agent, tools=tools, verbose=True).with_config(
        {"run_name": "Assistant"}
    )
    response = await executor.ainvoke(
        {
            "input": msg.topic,
        }
    )

    client = AsyncOpenAI()

    output_format = """
    Return in the following json format:

    {
        links:[
            {
                "url": url
                "title": title
            },
            {
                ...
            }
        ]
    }
    """

    links = await client.chat.completions.create(
        model="gpt-4-turbo",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "user",
                "content": f"Links: {response['output']} \n\n Format the previous links in json format: {output_format}",
            }
        ],
        max_tokens=1000,
    )

    links.choices[0].message.content
    return links.choices[0].message.content

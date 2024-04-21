import asyncio
import json
from typing import Any
from typing import Dict
from typing import List

from dotenv import load_dotenv
from langchain import hub
from langchain.agents import AgentExecutor
from langchain.agents import AgentType
from langchain.agents import create_tool_calling_agent
from langchain.agents import Tool
from langchain.tools import tool
from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain_openai import ChatOpenAI
from openai import AsyncOpenAI

load_dotenv()

agent_prompt = """
You are agent in charge of finding good images for lecture slides given the topic of the slide.
You have access to google images.

Remember, the images should be relevant to the topic and helpful for the students to understand the topic better.

First find four images that you think are good for the given topic.
Next, use get_descriptions tool to get the descriptions of the images.
"""


@tool
def get_descriptions(prompt: str, images: List[str]) -> str:
    """This function takes in a list of images and a prompt, and explains why the image is relevant to the prompt.

    :param prompt: str:
    :param images: List[str]:

    """
    client = AsyncOpenAI()

    async def get_one_description(image: str) -> str:
        try:
            response = await client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[{
                    "role":
                    "user",
                    "content": [
                        {
                            "type":
                            "text",
                            "text":
                            "Explain the contents of this image and how it is relevant to the prompt in two sentences.",
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image,
                            },
                        },
                    ],
                }],
                max_tokens=300,
            )

            return response.choices[0].message.content
        except Exception as e:
            return "Image failed to describe"

    image_descriptions = asyncio.run(
        asyncio.gather(*[get_one_description(image) for image in images]))

    # Link image urls with descriptions
    image_descriptions = [
        f"{image}: {description}"
        for image, description in zip(images, image_descriptions)
    ]
    return str(image_descriptions)


async def get_images(topic, num_images):
    client = AsyncOpenAI()
    prompt = hub.pull("hwchase17/openai-tools-agent")
    prompt.messages[0].prompt.template = agent_prompt
    llm = ChatOpenAI(temperature=0, model_name="gpt-4-turbo")
    search = GoogleSerperAPIWrapper(type="images")
    tools = [
        Tool(
            name="image_search",
            func=search.results,
            description="Useful for finding images",
        ),
        get_descriptions,
    ]

    agent = create_tool_calling_agent(llm, tools, prompt)
    executor = AgentExecutor(agent=agent, tools=tools).with_config(
        {"run_name": "Assistant"})

    response = await executor.ainvoke({
        "input": topic,
    })

    output_format = """
    Return in the following json format:

    {
        images:[
            {
                src: "image_url",
                description: "description of the image"
            },
            {
                ...
            }
        ]
    }
    """

    images = await client.chat.completions.create(
        model="gpt-4-turbo",
        response_format={"type": "json_object"},
        messages=[{
            "role":
            "user",
            "content":
            f"Images: {response['output']} \n\n Topic: {topic} \n\n From the images above, please select {num_images} images that you think are good for the given topic. Only select images that end in a image extension such as .jpg, .png etc \n\n Make sure to only return {num_images} number of images. {output_format}",
        }],
        max_tokens=2000,
    )

    images = json.loads(images.choices[0].message.content)

    return images["images"]

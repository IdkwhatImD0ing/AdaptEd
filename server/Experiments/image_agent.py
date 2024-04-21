from dotenv import load_dotenv
from langchain.agents import AgentType, Tool, AgentExecutor, create_tool_calling_agent
from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain import hub
from langchain_openai import ChatOpenAI
from langchain.tools import tool
from typing import List, Dict, Any
from openai import AsyncOpenAI
import asyncio
from nest_asyncio import apply
import json

apply()


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
    """
    This function takes in a list of images and a prompt, and explains why the image is relevant to the prompt.
    """
    client = AsyncOpenAI()

    async def get_one_description(image: str) -> str:
        response = await client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Explain the contents of this image and how it is relevant to the prompt in two sentences.",
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image,
                            },
                        },
                    ],
                }
            ],
            max_tokens=300,
        )

        return response.choices[0].message.content

    image_descriptions = asyncio.run(
        asyncio.gather(*[get_one_description(image) for image in images])
    )

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
        {"run_name": "Assistant"}
    )

    topic = "Slide on stacks in data structures"

    response = await executor.ainvoke(
        {
            "input": topic,
        }
    )

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
        messages=[
            {
                "role": "user",
                "content": f"Images: {response['output']} \n\n Topic: {topic} \n\n From the images above, please select {num_images} images that you think are good for the given topic. \n\n {output_format}",
            }
        ],
        max_tokens=2000,
    )

    images = json.loads(images.choices[0].message.content)

    return images

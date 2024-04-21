import ast
import asyncio
import json
import os
import random

import google.generativeai as genai
from dotenv import load_dotenv
from image_agent import get_images
from nest_asyncio import apply
from templates import templates
from wikipedia_tool import wikipedia_tool
from youtube import get_data

apply()

# Load environment variables from a .env file

load_dotenv()

# Parse API keys stored in an environment variable and convert them into a Python list
GEMINI_API_KEYS = os.environ.get("GEMINI_API_KEYS")
KEY_LIST = ast.literal_eval(GEMINI_API_KEYS)

# Shuffle the API keys list to ensure usage of different keys over time
random.shuffle(KEY_LIST)

# Initialize a global index to track the current API key being used
current_api_key_index = 0

genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

# List to store historical messages for reference or logging
messages = []


def cycle_api_key():
    """Retrieve the next API key from the list, cycling back to the start if necessary."""
    global current_api_key_index
    if current_api_key_index >= len(KEY_LIST) - 1:
        current_api_key_index = 0
    else:
        current_api_key_index += 1
    return KEY_LIST[current_api_key_index]


def generate_new_model():
    """Generate and configure a new AI model instance with a cycled API key."""
    global current_api_key_index
    global messages
    api_key = cycle_api_key()  # Cycle to the next API key

    # Configure the generative AI model with the new API key
    genai.configure(api_key=api_key)

    # Initialize the model with specific configurations
    model = genai.GenerativeModel(
        "gemini-1.5-pro-latest",
        generation_config=genai.GenerationConfig(
            temperature=0,  # Set deterministic behavior for the model
            max_output_tokens=8000,
        ),
    )
    return model


def sources_to_lecture(model, original_prompt, sources, audio, video):
    """Converts a list of sources into a single lecture template.

    :param sources: A list of sources, each containing a 'content' key with the source content.
    :type sources: list
    :param model: param original_prompt:
    :param audio: param video:
    :param original_prompt: param video:
    :param video: returns: A single lecture template combining all the source content.
    :returns: A single lecture template combining all the source content.
    :rtype: str

    """
    prompt = (
        "Available templates: \n\n"
        + str(templates)
        + "\n\n"
        + "Original Topic: "
        + original_prompt
        + "\n\n"
        + """
You are an advanced assistant that is in charge of aggregating multiple sources of information into a lecture based on a specific prompt.
Output 8 different slides on the topic given above using the sources provided as well as the given templates.
Make sure the slides flow logically and are easy to understand. Use the correct templates for the content you are presenting.
Keep text content short and concise, at most 8 words per text.
Make sure you always start off with a title slide.

Try to make each slide have different information.

Return a json parsable string of lectures that are generated from the sources provided.
Make sure the response is in the following format, only output the keys and values shown below:
{
    "title": title of the lecture,
    "description" : description of the lecture,
    "slides": [
        {
          "title": title of the slide,,
          "template_id": 1,
          "texts" : [
              "a stack is a data structure",
              "stacks are used in DFS"
          ],
          "speaker_notes" : A script for the speaker to read
        }
    ]
}
"""
    )
    lecture = model.generate_content(
        video
        + [
            audio,
            sources + prompt,
        ],
        request_options={"timeout": 1000},
    )
    return lecture.text


def sources_to_lecture_simple(model, original_prompt, sources):
    """Converts a list of sources into a single lecture template.

    :param sources: A list of sources, each containing a 'content' key with the source content.
    :type sources: list
    :param model: param original_prompt:
    :param original_prompt: returns: A single lecture template combining all the source content.
    :returns: A single lecture template combining all the source content.
    :rtype: str

    """
    prompt = (
        "Available templates: \n\n"
        + str(templates)
        + "\n\n"
        + "Original Topic: "
        + original_prompt
        + "\n\n"
        + """
You are an advanced assistant that is in charge of aggregating multiple sources of information into a lecture based on a specific prompt.
Output 8 different slides on the topic given above using the sources provided as well as the given templates.
Make sure the slides flow logically and are easy to understand. Use the correct templates for the content you are presenting.
Keep text content short and concise, at most 8 words per text.
Make sure you always start off with a title slide.

Try to make each slide have different information.

Return a json parsable string of lectures that are generated from the sources provided.
Make sure the response is in the following format, only output the keys and values shown below:
{
    "title": title of the lecture,
    "description" : description of the lecture,
    "slides": [
        {
          "title": title of the slide,,
          "template_id": 1,
          "texts" : [
              "a stack is a data structure",
              "stacks are used in DFS"
          ],
          "speaker_notes" : A script for the speaker to read
        }
    ]
}
"""
    )
    lecture = model.generate_content(
        sources + prompt,
        request_options={"timeout": 1000},
    )
    return lecture.text


async def get_lecture(result):
    tasks = []
    new_slides = []

    for slide in result["slides"]:
        template = [t for t in templates if t["template_id"] == slide["template_id"]][0]
        num_images = template["num_images"]

        if num_images == 0:
            print(num_images)
            new_slides.append({**slide, "images": []})
        else:
            topic = slide["title"]
            print(topic)
            print(num_images)
            # Schedule the get_images task for concurrent execution
            task = get_images(topic, num_images)
            tasks.append(task)

    # Run all tasks concurrently and collect results
    images_results = await asyncio.gather(*tasks)

    # Iterate over the slides that require images
    image_index = 0
    for slide in result["slides"]:
        template = [t for t in templates if t["template_id"] == slide["template_id"]][0]
        num_images = template["num_images"]
        if num_images != 0:
            new_slides.append({**slide, "images": images_results[image_index]})
            image_index += 1
    lecture = {**result, "slides": new_slides}

    return lecture


def generate(topic):
    """

    :param topic:

    """
    sources = wikipedia_tool.run(topic)
    model = generate_new_model()
    audio, video = get_data(topic)
    result = sources_to_lecture(model, topic, sources, audio, video)
    if "```json" in result:
        # Get the JSON content from the result
        result = result.split("```json")[1]
        result = result.split("```")[0]

    result = json.loads(result)

    lecture = asyncio.run(get_lecture(result))
    return lecture


def generate_simple(topic):
    """

    :param topic:

    """
    sources = wikipedia_tool.run(topic)
    model = generate_new_model()
    result = sources_to_lecture_simple(model, topic, sources)
    if "```json" in result:
        # Get the JSON content from the result
        result = result.split("```json")[1]
        result = result.split("```")[0]

    result = json.loads(result)

    lecture = asyncio.run(get_lecture(result))
    return lecture

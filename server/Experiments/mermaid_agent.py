from uagents import Agent, Bureau, Context, Model
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

system_prompt = """
You are a dedicated MermaidJS engineer specializing in creating easy to understand diagrams for lecture whiteboards.
You will be given the description of a diagram and your task is to write the MermaidJS template to generate that diagram.
You will be given a description of a diagram and your task is to write the MermaidJS template to generate that diagram. 

Only generate valid mermaid diagrams. You do not need to worry about edge cases like invalid syntax or infinite loops.
Make the diagram simple, easy to understand and visually appealing with custom colors and styling.

Example output:
```mermaid
graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
```
"""


class Message(Model):
    topic: str


mermaid = Agent(name="mermaid", seed="mermaid seed")


@mermaid.on_message(model=Message)
async def mermaid_message_handler(ctx: Context, sender: str, msg: Message):
    client = AsyncOpenAI()

    async def create_mermaid_diagram(prompt: str) -> str:
        response = await client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            max_tokens=300,
        )

        return response.choices[0].message.content

    response = await create_mermaid_diagram(msg.topic)
    if "```mermaid" in response:
        response = response.split("```mermaid")[1]
        response = response.split("```")[0]

    ctx.logger.info(response)

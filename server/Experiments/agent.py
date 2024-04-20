from uagents import Agent, Context
hume = Agent(name="hume", seed="hume_agent")

@hume.on_event("startup")
async def startup(ctx: Context):
    print("Hume is starting up")

hume.run()
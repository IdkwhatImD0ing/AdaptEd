from typing import List
from uagents import Context, Model, Protocol

class QueryTableRequest(Model):
   audio_base64: str
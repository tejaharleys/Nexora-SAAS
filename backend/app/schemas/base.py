from pydantic import BaseModel, ConfigDict
from uuid import UUID

class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

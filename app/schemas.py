from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ExpenseBase(BaseModel):
    title: str
    description: Optional[str] = None
    amount: float
    category: str
    date: Optional[datetime] = None

    @validator('date', pre=True)
    def parse_date(cls, value):
        if not value:
            return datetime.now()
        if isinstance(value, datetime):
            return value
        try:
            return datetime.strptime(value, '%Y-%m-%d')
        except (TypeError, ValueError):
            raise ValueError('Invalid date format. Use YYYY-MM-DD')

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True 
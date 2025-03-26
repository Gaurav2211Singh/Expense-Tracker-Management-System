# Expenses router is responsible for handling the expenses of the user.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter()


@router.post("/", response_model=schemas.Expense)
def create_expense(
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        # Print the received data for debugging
        print("Received expense data:", expense.dict())

        # Convert the expense to dict and add owner_id
        expense_data = expense.model_dump()
        expense_data["owner_id"] = current_user.id

        print("Creating expense with data:", expense_data)

        # Create the expense object
        db_expense = models.Expense(**expense_data)
        db.add(db_expense)
        db.commit()
        db.refresh(db_expense)
        return db_expense
    except Exception as e:
        print(f"Error creating expense: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create expense: {str(e)}",
        )


@router.get("/", response_model=List[schemas.Expense])
def read_expenses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    expenses = (
        db.query(models.Expense)
        .filter(models.Expense.owner_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return expenses


@router.get("/{expense_id}", response_model=schemas.Expense)
def read_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    expense = (
        db.query(models.Expense)
        .filter(
            models.Expense.id == expense_id, models.Expense.owner_id == current_user.id
        )
        .first()
    )
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.put("/{expense_id}", response_model=schemas.Expense)
def update_expense(
    expense_id: int,
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_expense = (
        db.query(models.Expense)
        .filter(
            models.Expense.id == expense_id, models.Expense.owner_id == current_user.id
        )
        .first()
    )
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    for key, value in expense.dict().items():
        setattr(db_expense, key, value)

    db.commit()
    db.refresh(db_expense)
    return db_expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_expense = (
        db.query(models.Expense)
        .filter(
            models.Expense.id == expense_id, models.Expense.owner_id == current_user.id
        )
        .first()
    )
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(db_expense)
    db.commit()
    return None

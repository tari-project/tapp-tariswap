import { Button, Paper, TextField, Typography } from "@mui/material"
import React, { useState } from "react"

export type InputTokensFormProps = {
  onSubmit: (firstTokenAmount: number, secondTokenAmount: number) => void
  callback: () => void
}

export const JoinPool = ({ onSubmit, callback }: InputTokensFormProps) => {
  const [firstTokenAmount, setFirstTokenAmount] = useState("0")
  const [secondTokenAmount, setSecondTokenAmount] = useState("0")
  const [firstTokenError, setFirstTokenError] = useState("")
  const [secondTokenError, setSecondTokenError] = useState("")

  const isValidInput = (input: string) => {
    return Number.isInteger(Number(input)) && input !== ""
  }

  const handleSubmit = async () => {
    if (!isValidInput(firstTokenAmount) || !isValidInput(secondTokenAmount)) {
      throw new Error("Please enter valid integer values")
    }
    await onSubmit(Number(firstTokenAmount), Number(secondTokenAmount))
    callback()
  }

  const handleFirstTokenAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (!isValidInput(value)) {
      setFirstTokenError("Please enter a valid integer value")
    } else {
      setFirstTokenError("")
    }
    setFirstTokenAmount(value)
  }

  const handleSecondTokenAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (!isValidInput(value)) {
      setSecondTokenError("Please enter a valid integer value")
    } else {
      setSecondTokenError("")
    }
    setSecondTokenAmount(value)
  }

  return (
    <Paper
      style={{
        display: "grid",
        gridRowGap: "20px",
        padding: "20px",
      }}
    >
      <Typography variant="h4">Join the pool with tokens:</Typography>

      <TextField
        label="Token A amount"
        value={firstTokenAmount}
        onChange={handleFirstTokenAmountChange}
        error={!!firstTokenError}
        helperText={firstTokenError}
        required
      />
      <TextField
        label="Token B amount"
        value={secondTokenAmount}
        onChange={handleSecondTokenAmountChange}
        error={!!secondTokenError}
        helperText={secondTokenError}
        required
      />
      <Button onClick={handleSubmit} variant={"contained"}>
        Submit
      </Button>
    </Paper>
  )
}

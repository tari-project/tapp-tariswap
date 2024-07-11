import { Button, Paper, TextField, Typography } from "@mui/material"
import React, { useState } from "react"

export type InputTokensFormProps = {
  onSubmit: (lpTokenAmount: number) => void
  callback: () => void
}

export const ExitPool = ({ onSubmit, callback }: InputTokensFormProps) => {
  const [firstTokenAmount, setFirstTokenAmount] = useState("0")
  const [firstTokenError, setFirstTokenError] = useState("")

  const isValidInput = (input: string) => {
    return Number.isInteger(Number(input)) && input !== ""
  }

  const handleSubmit = async () => {
    if (!isValidInput(firstTokenAmount)) {
      throw new Error("Please enter valid integer values")
    }
    await onSubmit(Number(firstTokenAmount))
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

  return (
    <Paper
      style={{
        display: "grid",
        gridRowGap: "20px",
        padding: "20px",
      }}
    >
      <Typography variant="h4">Exit the pool with LP tokens:</Typography>

      <TextField
        label="LP token amount"
        value={firstTokenAmount}
        onChange={handleFirstTokenAmountChange}
        error={!!firstTokenError}
        helperText={firstTokenError}
        required
      />
      <Button onClick={handleSubmit} variant={"contained"}>
        Submit
      </Button>
    </Paper>
  )
}

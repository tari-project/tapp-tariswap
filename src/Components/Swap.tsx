import { Box, Button, Paper, Switch, TextField, Typography } from "@mui/material"
import React, { useState } from "react"
import { FIRST_TOKEN_RESOURCE_ADDRESS, SECOND_TOKEN_RESOURCE_ADDRESS } from "../tariswap"

export type SwapProps = {
  handleSwap: (inputToken: string, tokenAmount: number, outputToken: string) => void
  callback: () => void
}

export const Swap = ({ handleSwap, callback }: SwapProps) => {
  const [tokenAmount, setTokenAmount] = useState("0")
  const [tokenAmountError, setTokenAmountError] = useState("")
  const [firstToSecond, setFirstToSecond] = useState(true)

  const isValidInput = (input: string) => {
    return Number.isInteger(Number(input))
  }

  const handleSubmit = async () => {
    if (!isValidInput(tokenAmount)) {
      throw new Error("Please enter valid integer values")
    }
    const inputToken = firstToSecond ? FIRST_TOKEN_RESOURCE_ADDRESS : SECOND_TOKEN_RESOURCE_ADDRESS
    const outputToken = firstToSecond ? SECOND_TOKEN_RESOURCE_ADDRESS : FIRST_TOKEN_RESOURCE_ADDRESS
    await handleSwap(inputToken, Number(tokenAmount), outputToken)
    callback()
  }

  const handleFirstTokenAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (!isValidInput(value)) {
      setTokenAmountError("Please enter a valid integer value")
    } else {
      setTokenAmountError("")
    }
    setTokenAmount(value)
  }

  return (
    <Paper
      style={{
        display: "grid",
        gridRowGap: "20px",
        padding: "20px",
      }}
    >
      <Typography variant="h4"> Swap tokens: </Typography>

      <TextField
        label={firstToSecond ? "Token A amount" : "Token B amount"}
        value={tokenAmount}
        onChange={handleFirstTokenAmountChange}
        error={!!tokenAmountError}
        helperText={tokenAmountError}
        required
      />
      <Box display="flex" alignItems="center">
        <Switch value={firstToSecond} onChange={() => setFirstToSecond(!firstToSecond)} />
        <Typography>{firstToSecond ? "Token A to Token B" : "Token B to Token A"}</Typography>
      </Box>
      <Button onClick={handleSubmit} variant={"contained"}>
        Submit
      </Button>
    </Paper>
  )
}

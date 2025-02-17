/* eslint-disable @typescript-eslint/no-explicit-any */
import { TariUniverseProvider } from "@tariproject/tarijs"
import * as cbor from "./cbor.ts"
import { getSubstate, submitAndWaitForTransaction } from "./wallet.ts"

export const SWAP_FEE = "50"
export const TARISWAP_TEMPLATE_ADDRESS = "52c1c37b0d6e984ecb32e07bb359823d13a5768edb658278c867be1cd0261f5a"
export const FIRST_TOKEN_RESOURCE_ADDRESS = "resource_e71c7c68bd239f3c4938d98b408e680259369ef415165801db0ef56b"
export const SECOND_TOKEN_RESOURCE_ADDRESS = "resource_a9af4f7fd8233de7e03e771b70bbbcd66f2e9a0a485135ef64d5a68a"
export const LP_TOKEN_RESOURCE_ADDRESS = "resource_ce023f7d7084c63ee6503c04f024c1402e038a4b8d318a45e9c3d550"
export const SWAP_COMPONENT_ADDRESS = "component_ce023f7d7084c63ee6503c04f024c1402e038a4b135a57d1edf48152"

export type PoolResources = {
  [key: string]: string
}

export async function createPool(provider: TariUniverseProvider) {
  const account = await provider.getAccount()
  const instructions = [
    {
      CallFunction: {
        template_address: TARISWAP_TEMPLATE_ADDRESS,
        function: "new",
        args: [FIRST_TOKEN_RESOURCE_ADDRESS, SECOND_TOKEN_RESOURCE_ADDRESS, SWAP_FEE],
      },
    },
  ]

  const required_substates = [{ substate_id: account.address }]

  const result: any = await submitAndWaitForTransaction(provider, account, instructions, required_substates)
  const upSubstates: any[] = result?.result?.Accept.up_substates
  const swapSubstate = {
    resource: upSubstates[4][0].Resource,
    component: upSubstates[5][0].Component,
  }
  console.log("Swap substate: ", swapSubstate)
  return result
}

export async function listPools(provider: TariUniverseProvider, pool_index_component: string) {
  const substate = await getSubstate(provider, pool_index_component)

  // extract the map of pools from the index substate
  const component_body = substate.value.substate.Component.body.state.Map
  const pools_field = component_body.find((field: any) => field[0].Text == "pools")
  const pools_value = pools_field[1].Map

  // extract the resource addresses and the pool component for each pool
  const pool_data = pools_value.map((value: any) => {
    const resource_pair = value[0].Array
    const resourceA = cbor.convertCborValue(resource_pair[0])
    const resourceB = cbor.convertCborValue(resource_pair[1])
    const poolComponent = cbor.convertCborValue(value[1])
    return { resourceA, resourceB, poolComponent }
  })

  return pool_data
}

export async function getPoolLiquidityResource(provider: TariUniverseProvider) {
  const substate = await getSubstate(provider, SWAP_COMPONENT_ADDRESS)

  // extract the map of pools from the index substate
  const component_body = substate.value.substate.Component.body.state
  const lpResource = cbor.getValueByPath(component_body, "$.lp_resource")

  return lpResource
}

export async function addLiquidity(provider: TariUniverseProvider, amountTokenA: number, amountTokenB: number) {
  const account = await provider.getAccount()
  const instructions = [
    {
      CallMethod: {
        component_address: account.address,
        method: "withdraw",
        args: [FIRST_TOKEN_RESOURCE_ADDRESS, amountTokenA.toString()],
      },
    },
    {
      PutLastInstructionOutputOnWorkspace: {
        key: [0],
      },
    },
    {
      CallMethod: {
        component_address: account.address,
        method: "withdraw",
        args: [SECOND_TOKEN_RESOURCE_ADDRESS, amountTokenB.toString()],
      },
    },
    {
      PutLastInstructionOutputOnWorkspace: {
        key: [1],
      },
    },
    {
      CallMethod: {
        component_address: SWAP_COMPONENT_ADDRESS,
        method: "add_liquidity",
        args: [{ Workspace: [0] }, { Workspace: [1] }],
      },
    },
    {
      PutLastInstructionOutputOnWorkspace: {
        key: [2],
      },
    },
    {
      CallMethod: {
        component_address: account.address,
        method: "deposit",
        args: [{ Workspace: [2] }],
      },
    },
  ]

  const required_substates = [{ substate_id: account.address }, { substate_id: SWAP_COMPONENT_ADDRESS }]

  const result = await submitAndWaitForTransaction(provider, account, instructions, required_substates)

  return result
}

export async function removeLiquidity(provider: TariUniverseProvider, amountLpToken: number) {
  const account = await provider.getAccount()
  const instructions = [
    {
      CallMethod: {
        component_address: account.address,
        method: "withdraw",
        args: [LP_TOKEN_RESOURCE_ADDRESS, amountLpToken.toString()],
      },
    },
    {
      PutLastInstructionOutputOnWorkspace: {
        key: [0],
      },
    },
    {
      CallMethod: {
        component_address: SWAP_COMPONENT_ADDRESS,
        method: "remove_liquidity",
        args: [{ Workspace: [0] }],
      },
    },
    {
      PutLastInstructionOutputOnWorkspace: {
        key: [1],
      },
    },
    {
      CallMethod: {
        component_address: account.address,
        method: "deposit",
        args: [{ Workspace: [1, 46, 48] }],
      },
    },
    {
      CallMethod: {
        component_address: account.address,
        method: "deposit",
        args: [{ Workspace: [1, 46, 49] }],
      },
    },
  ]
  const required_substates = [{ substate_id: account.address }, { substate_id: SWAP_COMPONENT_ADDRESS }]

  const result = await submitAndWaitForTransaction(provider, account, instructions, required_substates)

  return result
}

export async function swap(
  provider: TariUniverseProvider,
  inputToken: string,
  amountInputToken: number,
  outputToken: string
) {
  const account = await provider.getAccount()
  const instructions = [
    {
      CallMethod: {
        component_address: account.address,
        method: "withdraw",
        args: [inputToken, amountInputToken.toString()],
      },
    },
    {
      PutLastInstructionOutputOnWorkspace: {
        key: [0],
      },
    },
    {
      CallMethod: {
        component_address: SWAP_COMPONENT_ADDRESS,
        method: "swap",
        args: [{ Workspace: [0] }, outputToken],
      },
    },
    {
      PutLastInstructionOutputOnWorkspace: {
        key: [1],
      },
    },
    {
      CallMethod: {
        component_address: account.address,
        method: "deposit",
        args: [{ Workspace: [1] }],
      },
    },
  ]
  const required_substates = [{ substate_id: account.address }, { substate_id: SWAP_COMPONENT_ADDRESS }]

  const result = await submitAndWaitForTransaction(provider, account, instructions, required_substates)

  return result
}

export async function getPoolVaults(provider: TariUniverseProvider) {
  const substate = await getSubstate(provider, SWAP_COMPONENT_ADDRESS)
  const component_body = substate.value.substate.Component.body.state
  const vaults = cbor.getValueByPath(component_body, "$.pools")

  return vaults as PoolResources
}

export async function getPoolBalances(provider: TariUniverseProvider) {
  const balances: PoolResources = {}
  const vaults = await getPoolVaults(provider)
  for (const [resourceAddress, vaultAddress] of Object.entries(vaults)) {
    const substate = await getSubstate(provider, vaultAddress)
    const fungibleBody = substate.value.substate.Vault.resource_container.Fungible
    const balance = fungibleBody.amount
    balances[resourceAddress] = balance
  }

  return balances
}

export async function getPoolLPToken(provider: TariUniverseProvider) {
  const lp_resource = await getPoolLiquidityResource(provider)
  const substate = await getSubstate(provider, lp_resource)
  const token = substate.value.substate.Resource
  return token
}

import { useEffect, useMemo, useReducer } from "react"
import { db } from "../data/db"
import type { Guitar } from "../types"
import {
  cartReducer,
  initialCart,
  type CartState,
} from "../reducers/cart-reducer"

const initialState: CartState = {
  data: db,
  cart: initialCart(),
}

export const useCart = () => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.cart))
  }, [state.cart])

  function addToCart(item: Guitar) {
    dispatch({ type: "ADD_TO_CART", payload: { item } })
  }

  function removeFromCart(id: Guitar["id"]) {
    dispatch({ type: "REMOVE_FROM_CART", payload: { id } })
  }

  // function decreaseQuantity(id: Guitar["id"]) {
  //   dispatch({ type: "DECREASE_QUANTITY", payload: { id } })
  // }

  // function increaseQuantity(id: Guitar["id"]) {
  //   dispatch({ type: "INCREASE_QUANTITY", payload: { id } })
  // }



  function decreaseQuantity(id: Guitar["id"]) {
  dispatch({ type: "UPDATE_QUANTITY", payload: { id, amount: -1 } })
}

function increaseQuantity(id: Guitar["id"]) {
  dispatch({ type: "UPDATE_QUANTITY", payload: { id, amount: 1 } })
}



  function clearCart() {
    dispatch({ type: "CLEAR_CART" })
  }

  const isEmpty = useMemo(() => state.cart.length === 0, [state.cart])

  const cartTotal = useMemo(
    () =>
      state.cart.reduce((total, item) => total + item.quantity * item.price, 0),
    [state.cart]
  )

  return {
    data: state.data,
    cart: state.cart,
    addToCart,
    removeFromCart,
    decreaseQuantity,
    increaseQuantity,
    clearCart,
    isEmpty,
    cartTotal,
  }
}
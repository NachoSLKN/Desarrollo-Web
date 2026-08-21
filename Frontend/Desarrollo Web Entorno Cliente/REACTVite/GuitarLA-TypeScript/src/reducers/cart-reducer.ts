import type { CartItem, Guitar } from "../types" //Importamos los tipos, Guitar es el modelo base y CartItem es Guitar + quantity

export type CartState = { //Definimos la forma del estado en que gestiona el reducer
  data: Guitar[] //Es el catálogo de guitarras 
  cart: CartItem[] //Carrito con cantidades 
}

export type CartAction =
//Lista cerrada de acciones permitidas. Cada acción lleva su type y su payload.
  | { type: "ADD_TO_CART"; payload: { item: Guitar } }
  | { type: "REMOVE_FROM_CART"; payload: { id: Guitar["id"] } }
//   | { type: "INCREASE_QUANTITY"; payload: { id: Guitar["id"] } }
//   | { type: "DECREASE_QUANTITY"; payload: { id: Guitar["id"] } }
  | { type: "UPDATE_QUANTITY"; payload: { id: Guitar["id"]; amount: number } }
  | { type: "CLEAR_CART" }

export const initialCart = (): CartItem[] => {  //Devuelve siempre un array de CartItem
    //Función helper que inicializa el carrito desde localStorage.
  const localStorageCart = localStorage.getItem("cart") //Lee el string almacenado (o null si no existe)
  return localStorageCart ? JSON.parse(localStorageCart) : []  //Si hay datos convierte JSON en array. Sino hay datos vacío.
}


export function cartReducer(
//Un reducer es una acción pura que recibe el estado actual y una acción y devuelve un nuevo estado.
//No debe mutar.

  state: CartState,
  action: CartAction
): CartState {
  const MIN_ITEMS = 1 //Reglas de negocio no bajar de 1
  const MAX_ITEMS = 5 // Regla de negocio no subir de 5
  //Centralizando las reglas evitamos duplicarlas en componentes.

  switch (action.type) {
    //Selector principal que ejecuta la lógica según el tipo de acción. Es un patrón típico.

    case "ADD_TO_CART": { //Acción que añade un producto al carrito. Si ya existe incrementa la cantidad. Si no existe = +1.
      const { item } = action.payload //Extrae la guitarra que se quiere añadir.

      const itemExists = state.cart.findIndex((g) => g.id === item.id) //Busca si hay un elemento con el mismo ID.

      if (itemExists >= 0) { //El producto ya estaba en el carrito.
        if (state.cart[itemExists].quantity >= MAX_ITEMS) return state

        const updatedCart = [...state.cart] //Copia para no modificar el array original.
        updatedCart[itemExists] = { //Reemplaza el elemento con una copia actualizada. Incrementa en +1 la cantidad. 
          ...updatedCart[itemExists],
          quantity: updatedCart[itemExists].quantity + 1,
        }

        return {
          ...state,
          cart: updatedCart,
        }
      }

      const newItem: CartItem = { ...item, quantity: 1 } //Rama: no existía, crea un CartItem añadiendo quantity. 

      return { //Añade el nuevo item al final del carrito sin modificar el array original.
        ...state,
        cart: [...state.cart, newItem],
      }
    }

    case "REMOVE_FROM_CART": { //Elimina un producto del carrito por ID.
      const { id } = action.payload
      return {
        ...state,
        cart: state.cart.filter((g) => g.id !== id),
      }
    }

    // case "DECREASE_QUANTITY": {
    //   const { id } = action.payload
    //   const updatedCart = state.cart.map((item) => {
    //     if (item.id === id && item.quantity > MIN_ITEMS) {
    //       return { ...item, quantity: item.quantity - 1 }
    //     }
    //     return item
    //   })

    //   return {
    //     ...state,
    //     cart: updatedCart,
    //   }
    // }

    // case "INCREASE_QUANTITY": {
    //   const { id } = action.payload
    //   const updatedCart = state.cart.map((item) => {
    //     if (item.id === id && item.quantity < MAX_ITEMS) {
    //       return { ...item, quantity: item.quantity + 1 }
    //     }
    //     return item
    //   })

    //   return {
    //     ...state,
    //     cart: updatedCart,
    //   }
    // }



 case "UPDATE_QUANTITY": { 
  const { id, amount } = action.payload

  const updatedCart = state.cart.map((item) => {
    if (item.id === id) {
      const newQuantity = item.quantity + amount

      if (newQuantity < MIN_ITEMS || newQuantity > MAX_ITEMS) {
        return item
      }

      return {
        ...item,
        quantity: newQuantity,
      }
    }

    return item
  })

  return {
    ...state,
    cart: updatedCart,
  }
}






    case "CLEAR_CART": { //Vacía el carrito por completo. 
      return {
        ...state,
        cart: [],
      }
    }

    default:
      return state
  }
}


/*UseReducer no interactúa con el DOM ni con localstorage: solo calcula estado.
Los efectos secundarrios (comoguardar en el localStorage) se hacen en el hook con useEffect. 
Originalmente useReducer tenía dos acciones separadas:
- INCREASE_QUANTITY
- DECREASE_QUANTITY
Para simplificar y hacer el reducer más sencillo y escalable,
se han unnificado ambas en una sola acción genérica.
- UPDATE_QUANTITY
Consiguiendo que el reducer solo nbecesite un único case para modificar cantidades.*/ 
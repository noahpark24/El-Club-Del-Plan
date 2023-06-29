import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const plansSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {
    setPlans: (state, action) => {
      return action.payload.slice(0, 6);
    },
    removePlan: (state, action) => {
      let newState = { ...state };
      newState = newState.filter((item) => item._id !== action.payload);
      return newState;
    },
    addPlan: (state, action) => {
      let newState = { ...state };
      newState = newState.concat([action.payload]);
      return newState;
    },
  },
});

export const { setPlans, removePlan, addPlan } = plansSlice.actions;
export default plansSlice.reducer;

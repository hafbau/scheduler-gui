import { useReducer, useEffect } from "react";

import axios from "axios";

export const SET_DAY = "SET_DAY";
export const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
export const SET_INTERVIEW = "SET_INTERVIEW";

import useRealTimeUpdate from "hooks/useRealtimeUpdate";

function reducer(state, action) {
  switch (action.type) {
    case SET_DAY:
      return { ...state, day: action.day };
    case SET_APPLICATION_DATA:
      return {
        ...state,
        days: action.days,
        appointments: action.appointments,
        interviewers: action.interviewers
      };
    case SET_INTERVIEW: {
      const appointment = {
        ...state.appointments[action.id],
        interview: action.interview && { ...action.interview }
      };

      const appointments = {
        ...state.appointments,
        [action.id]: appointment
      };

      const getSpotsForDay = day =>
        day.appointments.length -
        day.appointments.reduce(
          (count, id) => (appointments[id].interview ? count + 1 : count),
          0
        );

      const days = state.days.map(day => {
        return day.appointments.includes(action.id)
          ? {
              ...day,
              spots: getSpotsForDay(day)
            }
          : day;
      });

      return {
        ...state,
        appointments,
        days
      };
    }
    default:
      throw new Error(
        `Tried to reduce with unsupported action type: ${action.type}`
      );
  }
}

export default function useApplicationData() {
  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {}
  });

  const setDay = day => dispatch({ type: SET_DAY, day });

  useEffect(() => {
    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers")
    ]).then(
      ([{ data: days }, { data: appointments }, { data: interviewers }]) =>
        dispatch({
          type: SET_APPLICATION_DATA,
          days,
          appointments,
          interviewers
        })
    );
  }, []);

  useRealTimeUpdate(dispatch);

  function bookInterview(id, interview) {
    return axios.put(`/api/appointments/${id}`, { interview }).then(() => {
      dispatch({
        type: SET_INTERVIEW,
        id,
        interview
      });
    });
  }

  function cancelInterview(id) {
    return axios.delete(`/api/appointments/${id}`).then(() => {
      dispatch({
        type: SET_INTERVIEW,
        id,
        interview: null
      });
    });
  }

  return {
    state,
    setDay,
    bookInterview,
    cancelInterview
  };
}

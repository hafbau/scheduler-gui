import { useReducer, useEffect } from "react";

import axios from "axios";

const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";
const INCREASE_SPOTS = "INCREASE_SPOTS";
const DECREASE_SPOTS = "DECREASE_SPOTS";

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
        interview: { ...action.interview }
      };

      const appointments = {
        ...state.appointments,
        [action.id]: appointment
      };

      return {
        ...state,
        appointments
      };
    }
    case INCREASE_SPOTS: {
      return {
        ...state,
        days: state.days.map(day => {
          return day.appointments.includes(action.id)
            ? { ...day, spots: day.spots + 1 }
            : day;
        })
      };
    }
    case DECREASE_SPOTS: {
      return {
        ...state,
        days: state.days.map(day => {
          return day.appointments.includes(action.id)
            ? { ...day, spots: day.spots - 1 }
            : day;
        })
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

  function bookInterview(id, interview) {
    return axios.put(`/api/appointments/${id}`, { interview }).then(() => {
      dispatch({ type: SET_INTERVIEW, id, interview });
      dispatch({ type: DECREASE_SPOTS, id });
    });
  }

  function cancelInterview(id) {
    return axios.delete(`/api/appointments/${id}`).then(() => {
      dispatch({ type: SET_INTERVIEW, id, interview: null });
      dispatch({ type: INCREASE_SPOTS, id });
    });
  }

  return {
    state,
    setDay,
    bookInterview,
    cancelInterview
  };
}

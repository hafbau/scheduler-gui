import { useReducer, useEffect } from "react";

import axios from "axios";

const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";

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

      return {
        ...state,
        appointments,
        days: state.days.map(day => {
          return day.appointments.includes(action.id)
            ? { ...day, spots: day.spots + (action.interview ? -1 : 1) }
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

  useEffect(() => {
    const socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
    socket.onopen = event => {
      socket.send("ping");
    };

    socket.onmessage = event => {
      console.log(`Message Received: ${event.data}`);
      const { id, interview } = JSON.parse(event.data);
      dispatch({
        type: SET_INTERVIEW,
        id,
        interview
      });
    };

    return () => {
      socket.close();
    };
  }, []);

  function bookInterview(id, interview) {
    return axios.put(`/api/appointments/${id}`, { interview });
  }

  function cancelInterview(id) {
    return axios.delete(`/api/appointments/${id}`);
  }

  return {
    state,
    setDay,
    bookInterview,
    cancelInterview
  };
}

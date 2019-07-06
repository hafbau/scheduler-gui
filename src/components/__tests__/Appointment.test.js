import React from "react";

import { render } from "react-testing-library";

import Appointment from "components/Appointment";

describe("Appointment", () => {
  it("renders without crashing", () => {
    render(<Appointment />);
  });

  it("renders without crashing when the mode is SHOW but the value of interview is null", () => {
    const interview = {
      student: "Lydia Miller-Jones",
      interviewer: {
        id: 1,
        name: "Sylvia Palmer",
        avatar: "https://i.imgur.com/LpaY82x.png"
      }
    };

    const { getByText, rerender } = render(
      <Appointment interview={interview} />
    );

    expect(getByText("Lydia Miller-Jones")).toBeInTheDocument();

    rerender(<Appointment interview={null} />);
  });
});

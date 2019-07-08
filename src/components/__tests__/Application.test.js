import React from "react";

import { render, waitForElement, fireEvent } from "@testing-library/react";

import Application from "components/Application";

describe("Application", () => {
  it("changes the schedule when a new day is selected", () => {
    const { getByText } = render(<Application />);

    return waitForElement(() => getByText("Archie Cohen")).then(() => {
      fireEvent.click(getByText("Tuesday"));

      expect(getByText("Leopold Silvers")).toBeInTheDocument();
    });
  });
});

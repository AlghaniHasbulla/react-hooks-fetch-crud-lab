import React from "react";
import "whatwg-fetch";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { server } from "../mocks/server";

import App from "../components/App";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("displays question prompts after fetching", async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/View Questions/));
  expect(await screen.findByText(/lorem testum 1/i)).toBeInTheDocument();
  expect(await screen.findByText(/lorem testum 2/i)).toBeInTheDocument();
});

test("creates a new question when the form is submitted", async () => {
  render(<App />);
  await screen.findByText(/lorem testum 1/i);

  fireEvent.click(screen.getByText("New Question"));

  fireEvent.change(screen.getByLabelText(/Prompt/), {
    target: { value: "Test Prompt" },
  });
  fireEvent.change(screen.getByLabelText(/Answer 1/), {
    target: { value: "Test Answer 1" },
  });
  fireEvent.change(screen.getByLabelText(/Answer 2/), {
    target: { value: "Test Answer 2" },
  });
  fireEvent.change(screen.getByLabelText(/Answer 3/), {
    target: { value: "Test Answer 3" },
  });
  fireEvent.change(screen.getByLabelText(/Answer 4/), {
    target: { value: "Test Answer 4" },
  });
  fireEvent.change(screen.getByLabelText(/Correct Answer/), {
    target: { value: "1" },
  });

  fireEvent.click(screen.getByText(/Add Question/));
  fireEvent.click(screen.getByText(/View Questions/));

  expect(await screen.findByText(/Test Prompt/)).toBeInTheDocument();
  expect(await screen.findByText(/lorem testum 1/i)).toBeInTheDocument();
});

test("deletes the question when the delete button is clicked", async () => {
  const { rerender } = render(<App />);
  fireEvent.click(screen.getByText(/View Questions/));

  await screen.findByText(/lorem testum 1/i);

  fireEvent.click(screen.getAllByText(/Delete Question/)[0]);

  await waitForElementToBeRemoved(() => screen.queryByText(/lorem testum 1/i));
  rerender(<App />);

  await screen.findByText(/lorem testum 2/i);
  expect(screen.queryByText(/lorem testum 1/i)).not.toBeInTheDocument();
});

test("updates the answer when the dropdown is changed", async () => {
  const { rerender } = render(<App />);
  fireEvent.click(screen.getByText(/View Questions/));
  await screen.findByText(/lorem testum 2/i);

  const dropdown = screen.getAllByLabelText(/Correct Answer/)[0];
  fireEvent.change(dropdown, { target: { value: "3" } });

  await waitFor(() => {
    expect(dropdown.value).toBe("3");
  });

  rerender(<App />);

  const updatedDropdown = screen.getAllByLabelText(/Correct Answer/)[0];
  expect(updatedDropdown.value).toBe("3");
});

import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

test("renders learn react link", () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  const title = screen.getByTitle("AI Image");
  expect(linkElement).toBeInTheDocument();
  expect(title).toBeInTheDocument();
});

test("Testing Input Box", () => {
  render(<App />);
  let checkInput = screen.getByRole("textbox");
  let checkPlaceHolder = screen.getByPlaceholderText("Enter Name");
  fireEvent.change(checkInput, {target: {value: "a"}})
  expect(checkInput).toBeInTheDocument();
  expect(checkPlaceHolder).toBeInTheDocument();
  expect(checkInput.value).toBe("a")
});



describe("UI Test Group", () => {
  test("renders learn react link", () => {
    render(<App />);
    const linkElement = screen.getByText(/learn react/i);
    const title = screen.getByTitle("AI Image");
    expect(linkElement).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });

  test("Testing Input Box", () => {
    render(<App />);
    let checkInput = screen.getByRole("textbox");
    let checkPlaceHolder = screen.getByPlaceholderText("Enter Name");
    expect(checkInput).toBeInTheDocument();
    expect(checkPlaceHolder).toBeInTheDocument();
  });
});

// We can use nested describe - means ek describe k undar aur ek describe

describe.skip("UI Test Groupp", () => {}) // To skip this group
describe.only("UI Test Grouppp", () => {}) //  For only test this group

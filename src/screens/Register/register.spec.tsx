import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Register } from ".";
import theme from "../../global/styles/theme";
import { ThemeProvider } from "styled-components/native";
import { AuthProvider } from "../../hooks/auth";

const Providers: React.FC = ({ children }) => (
  <AuthProvider>
    <ThemeProvider theme={theme}>
      { children }
    </ThemeProvider>
  </AuthProvider>
);

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: jest.fn()
  }
});

describe('Register Screen', () => {
  it('should be open category modal when user click on button', async () => {
    const { getByTestId } = render(<Register />, {
      wrapper: Providers
    });
    const categoryModal = getByTestId('modal-category');
    const buttonCategory = getByTestId('button-category');
    fireEvent.press(buttonCategory);
    await waitFor(() => {
      expect(categoryModal.props.visible).toBeTruthy();
    })
  });
});
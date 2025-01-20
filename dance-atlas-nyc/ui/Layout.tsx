import { AppBar, Container } from "@mui/material";
import { ReactNode } from "react";

export function NavBar(props: { children: ReactNode }) {
  return (
    <AppBar
      position="sticky"
      sx={{
        maxHeight: "5vh",
        backgroundColor: "gray.100",
        boxShadow: 3,
        width: "100%",
        "&.MuiAppBar-root": {
          backgroundColor: "background.default", // You can use theme for dark mode
        },
        flex: "row",
      }}
    >
      {props.children}
    </AppBar>
  );
}

export function ContentContainer(props: { children: ReactNode }) {
  return (
    <Container sx={{ maxHeight: "95vh", overflowY: "auto" }}>
      {props.children}
    </Container>
  );
}

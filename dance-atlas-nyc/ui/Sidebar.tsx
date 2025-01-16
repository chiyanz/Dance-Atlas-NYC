import React from "react";
import { Drawer, IconButton, Box } from "@mui/material";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";

type SidebarProps = {
  open: boolean;
  setMenuOpen: (open: boolean) => void;
  /**
   * the "sidebar" can optionally act as a overlay that doesn't disrupt other components
   * this distinction is primarily for mobile/smaller viewports
   */
  isOverlay?: boolean;
  children: React.ReactNode;
};

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  setMenuOpen,
  isOverlay = false,
  children,
}) => {
  return (
    <Drawer
      open={open}
      onClose={() => setMenuOpen(false)}
      anchor="left"
      variant={isOverlay ? "temporary" : "persistent"} // Handles overlay or sidebar
      sx={{
        marginTop: 3,
        zIndex: 1300,
        "& .MuiDrawer-paper": {
          width: "280px",
          height: "100vh",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          padding: 3,
          transition: "transform 0.3s ease-in-out",
        },
      }}
    >
      {/* Close button */}
      <IconButton
        sx={{
          position: "absolute",
          top: "16px",
          left: "24px",
          borderRadius: "4px",
          color: "text.primary",
          backgroundColor: "transparent",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.1)",
          },
        }}
        onClick={() => setMenuOpen(false)}
      >
        <KeyboardDoubleArrowLeftIcon />
      </IconButton>

      {/* Sidebar children */}
      <Box
        sx={{
          marginTop: 6,
          display: "flex",
          flexDirection: "column",
          rowGap: 3,
        }}
      >
        {children}
      </Box>
    </Drawer>
  );
};

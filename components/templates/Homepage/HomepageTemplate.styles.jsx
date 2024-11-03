import { styled } from "@mui/system";

export const ResizableDivider = styled("div")(({ theme }) => ({
  cursor: "col-resize",
  width: "3px",
  backgroundColor: "#dbdbdb",
  borderRadius: "5px",
  height: "75px",
  "&:hover": {
    backgroundColor: "#bbb",
  },
  margin: "auto 0px",
}));

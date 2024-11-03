"use cli";
import Head from "next/head";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import { useState, useCallback, useRef } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import { sendQuestion } from "../../../services/askService";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ResizableDivider } from "./HomepageTemplate.styles";
import { DataGrid } from "@mui/x-data-grid";

import Typewriter from "typewriter-effect";

const HomePageTemplate = () => {
  const [text, setText] = useState("");
  const [question, setQuestion] = useState("");
  const [questionsWidth, setQuestionsWidth] = useState(300);
  const [history, setHistory] = useState([]);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const endOfBoxRef = useRef(null);

  const postQuestion = useCallback(async () => {
    try {
      setError("");
      setResponse("");
      setLoading(true);

      const result = await sendQuestion(text);

      setHistory((prevHistory) => [
        ...prevHistory,
        {
          question: result.question,
          answer: result.answer,
          sql: result.sql_query,
          columns: result.columns,
          data: result.data,
          fullWidth: false,
        },
      ]);
      // }
      setResponse(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [text]);

  const handleFullWidthToggle = (index) => {
    // Update the specific item's fullWidth property
    setHistory((prevHistory) => {
      const newHistory = [...prevHistory];
      newHistory[index] = {
        ...newHistory[index],
        fullWidth: !newHistory[index].fullWidth, // Toggle the fullWidth state
      };
      return newHistory;
    });
  };

  const handleButtonClick = (question) => {
    setText(question);
  };

  const handleSendClick = () => {
    if (text.trim()) {
      postQuestion();
      setQuestion(text.trim());
      setText("");
      if (endOfBoxRef.current) {
        endOfBoxRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = questionsWidth;

    const handleMouseMove = (e) => {
      const newWidth = startWidth + (e.clientX - startX);
      setQuestionsWidth(Math.max(300, Math.min(newWidth, 600)));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  console.log(response);

  return (
    <Box>
      <Box
        sx={{
          backgroundColor: "#1b116b",
          width: "100vw",
          minHeight: "100vh",
          margin: "0px",
          display: "flex",
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            margin: "30px 35px",
            gap: "10px",
          }}
        >
          <Box
            sx={{
              width: questionsWidth,
              paddingRight: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              userSelect: "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: "20px",
                alignItems: "center",
                padding: "10px 20px",
                margin: "0px auto",
              }}
            >
              <img src="/test.png" width={"60px"} />
              <Typography variant="h4" color="white">
                Datatopia
              </Typography>
            </Box>
            <Divider
              sx={{
                borderColor: "#dbdbdb",
                width: "100%",
              }}
            />
            <Typography
              variant="h6"
              sx={{ color: "#fefefe", marginTop: "20px" }}
            >
              Popular Questions
            </Typography>
            <Box
              sx={{
                width: "100%",
                overflowY: "auto",
                display: "flex",
                gap: "10px",
                flexDirection: "column",
                maxHeight: "80vh",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                scrollbarWidth: "none",
                "-ms-overflow-style": "none",
              }}
            >
              {["Inventory and Stock Management"].map((title, index) => (
                <Accordion
                  key={index}
                  sx={{ backgroundColor: "transparent" }}
                  defaultExpanded
                  disableGutters
                >
                  <AccordionSummary>
                    <Typography sx={{ color: "white" }}>{title}</Typography>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{ display: "flex", flexDirection: "column" }}
                  >
                    {[
                      "What is the highest selling product?",
                      "What are my total sales?",
                      "What are my total sales per item?",
                      "How many customers do I have?",
                      "What is my total sales per product?",
                      "What is the average order total?",
                      "How many repeat customers do I have?",
                      "How much money did I make in 2024?",
                      "How much money did I make in October 2024?",
                      "On average how many items are in each order?",
                      "What is my most expensive item?",
                    ].map((question) => (
                      <Button
                        key={question}
                        onClick={() => handleButtonClick(question)}
                        sx={{
                          color: "#fefefe",
                          justifyContent: "flex-start",
                          textAlign: "left",
                          "&:hover": {
                            backgroundColor: "#4a438a",
                          },
                        }}
                      >
                        <Typography
                          variant="s1"
                          sx={{
                            color: "white",
                            textTransform: "capitalize",
                          }}
                        >
                          {question}
                        </Typography>
                      </Button>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Box>
          <ResizableDivider onMouseDown={handleMouseDown} />
          <Box
            sx={{
              backgroundColor: "#fefefe",
              borderRadius: "10px",
              padding: "50px",
              position: "relative",
              flexGrow: 1,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                bottom: "50px",
                right: "50px",
                left: "50px",
              }}
            >
              <TextField
                placeholder="Ask me a question about your pharmacy"
                fullWidth
                variant="outlined"
                value={text}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <ArrowCircleUpIcon
                          sx={{ color: "#1b116b", fontSize: "30px" }}
                          onClick={handleSendClick} // Trigger send on icon click
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                onChange={(e) => setText(e.target.value)}
                sx={{
                  "& label.Mui-focused": {
                    color: "#1b116b",
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#1b116b",
                    },
                    "&:hover fieldset": {
                      borderColor: "#1b116b",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1b116b",
                    },
                    "& input": {
                      color: "#1b116b",
                    },
                    borderRadius: "100px",
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                marginTop: "20px",
                gap: "20px",
                maxHeight: "70vh",
                overflow: "scroll",
              }}
            >
              {history.map((item, index) => (
                <Box key={index}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Typography
                      sx={{
                        backgroundColor: "#e8fcee",
                        borderRadius: "10px",
                        padding: "10px",
                        maxWidth: "70%",
                        textAlign: "right",
                      }}
                    >
                      {item.question}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      marginTop: "10px",
                    }}
                  >
                    <Typography
                      sx={{
                        backgroundColor: "#f1f0ff",
                        borderRadius: "10px",
                        padding: "10px",
                        maxWidth: "70%",
                        textAlign: "left",
                      }}
                    >
                      <Typewriter
                        onInit={(typewriter) => {
                          typewriter
                            .typeString(item.answer)
                            .callFunction(() => {
                              typewriter.stop(); // Stops after one full pass
                            })
                            .start();
                        }}
                        options={{
                          delay: 25,
                        }}
                      />
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      marginTop: "10px",
                      width: item.fullWidth ? "100%" : "70%",
                    }}
                  >
                    <Accordion
                      disableGutters
                      sx={{
                        border: "1px solid #c9c5eb",
                        boxShadow: "none",
                      }}
                    >
                      <AccordionSummary>
                        <Typography>
                          How was this answer was generated?
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "20px",
                          }}
                        >
                          <Typography variant="h6">SQL Query:</Typography>
                          <Typography component="span">{item.sql}</Typography>
                          <Typography variant="h6">Resulting Data:</Typography>
                          {item.columns?.length > 0 && (
                            <DataGrid
                              rows={item.data.map((row, index) => ({
                                ...row,
                                id: index,
                              }))}
                              columns={item.columns?.map((column) => ({
                                field: column,
                                headerName: column,
                                flex: 1,
                              }))}
                              getRowId={(row) => row.id}
                              disableSelectionOnClick
                            />
                          )}
                          <Button onClick={() => handleFullWidthToggle(index)}>
                            {item.fullWidth
                              ? "Revert to Default Width"
                              : "View Full Width"}
                          </Button>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                </Box>
              ))}
              <div ref={endOfBoxRef} />
              {loading && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: "20px",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Typography
                      sx={{
                        backgroundColor: "#e8fcee",
                        borderRadius: "10px",
                        padding: "10px",
                        maxWidth: "70%",
                        textAlign: "right",
                      }}
                    >
                      {question}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      color: "#1b116b",
                      marginTop: "20px",
                      textAlign: "center",
                    }}
                  >
                    Generating Response...
                  </Typography>
                </Box>
              )}
              {error && (
                <Typography sx={{ color: "red", marginTop: "20px" }}>
                  {error}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePageTemplate;

import {
  Badge,
  Box,
  Button,
  Center,
  Grid,
  Group,
  Image,
  Modal,
  Text,
} from "@mantine/core";
import axios from "axios";
import { useRef, useState, useEffect, useContext, useMemo } from "react";
import Editor from "../components/Editor/Editor";
import LeftPane from "../components/Editor/LeftPane";
import RightPane from "../components/Editor/RightPane";

import "./MainPage.css";

import ACTIONS from "../Actions";
import { initSocket } from "../socket";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { USER_DATA, GET_PROJECTS, SAVE_CODE } from "../assets/queries";
import Def from "../components/Editor/default";
import StoreContext from "../assets/StoreContext";

import logo from "../assets/Aside.png";

import { FaDownload } from "react-icons/fa";
import logo404 from "../assets/404.jpeg";

function MainPage() {

  console.log("MAINPAGE RERENDERED")
  const codeRef = useRef(null);
  const [clients, setClients] = useState([]);
  const [fsize, setFsize] = useState(18);
  const [opened, setOpened] = useState(false);
  const [output, setOutput] = useState(null);
  const [dlink, setDlink] = useState(null);

  const { projectId } = useParams();
  const [pid, setPid] = useState(projectId);
  const navigate = useNavigate();

  const [SaveCode, { load }] = useMutation(SAVE_CODE);

  let editorRef = useRef();

  const { setOptions, socketRef, setCast } = useContext(StoreContext);

  const [dis, setDis] = useState(false);

  const handleDownload = async () => {
    const content = editorRef.current.getValue();
    const fileName = pdata.data?.project.projectName;
    const fileExtension =
      lang === "python" ? "py" : lang === "cmake" ? "cpp" : "js";

    const file = new Blob([content], { type: "text/plain" });

    console.log(content, fileExtension, fileName);

    const link = document.createElement("a");
    link.download = URL.createObjectURL(file);
    setDlink({ link: link.download, fname: `${fileName}.${fileExtension}` });
  };

  async function handleCompile() {
    setDis(true);
    const lan =
      lang === "python" ? "python" : lang === "cmake" ? "cpp17" : "nodejs";
    const fileExtension =
      lang === "python" ? "py" : lang === "cmake" ? "cpp" : "js";

    const options = {
      method: "POST",
      url: "https://online-code-compiler.p.rapidapi.com/v1/",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": "c6951eacb2msh1e2138478e188edp1288fejsn62895d1b4678",
        "X-RapidAPI-Host": "online-code-compiler.p.rapidapi.com",
      },
      data: {
        language: lan,
        version: "latest",
        code: editorRef.current.getValue(),
        input: null,
      },
    };

    console.log(options);

    try {
      const response = await axios.request(options);
      console.log(response.data);

      setOutput({
        title: "Compilation Successfull ",
        text: response?.data.output,
        color: "green",
      });

      setOpened(true);
    } catch (error) {
      console.error(error);
      setOutput({
        title: "Compilation Error",
        text: error,
        color: "red",
      });
    }

    // await fetch(url, options)
    //   .then((res) => res.json())
    //   .then((res) => {

    //   });

    setDis(false);
  }

  useEffect(() => {
    if (socketRef.current && projectId != -1) {
      console.log("SOCKET EXISTSSSS");
      socketRef.current.on(ACTIONS.GET_BROADCAST, ({ cast }) => {
        console.log("CAUGHT GET BROADCAST", cast);
        setCast(cast);
        setTimeout(() => {
          setCast(null);
        }, 10000000);
      });

      
    }
  }, [socketRef?.current]);

  const handleSave = async(e) => {
    e.preventDefault();
    
    await SaveCode({
      variables: {
        projectId: projectId,
        content: editorRef.current.getValue(),
      },
    }).then(()=>{
      
      setTimeout(() => {
        console.log("SAVED TO DB" , editorRef.current.getValue())
        setOptions({
          text: "Successfully saved",
          color: "green",
          title: "Success",
        });
        setTimeout(() => {
          setOptions(null);
        }, 3000);

      }, 5000);
    })
  };

  const uid = localStorage.getItem("uid");

  const { loading, error, data } = useQuery(USER_DATA, {
    variables: {
      userId: uid,
    },
  });

  const { loading: loading2, error: error2, data: pdata } = useQuery(GET_PROJECTS, {
    variables: {
      projectId,
    },
    fetchPolicy: 'no-cache',
  });
  
  

  console.log("L2f", pdata);

  useEffect(() => {
    console.log("USEEFFECT PROJECT ID CHANGED CALLED")
    
    async function init() {
      const uid = localStorage.getItem("uid");
      console.log("INIT CALLED");

      if (!uid) {
        setOptions({
          text: "Something went wrong",
          color: "red",
          title: "Sorry",
        });

        setTimeout(() => {
          setOptions(null);
        }, 3000);
        navigate("/", { replace: true });
      }
      if (projectId !== -1) {
        console.log("PID != -1")
        socketRef.current = await initSocket();
        socketRef.current.on("connect_error", (err) => handleErrors(err));
        socketRef.current.on("connect_failed", (err) => handleErrors(err));


        function handleErrors(e) {
          console.log(e, "HEREEE");
          setOptions({
            text: "Something went wrong",
            color: "red",
            title: "Sorry",
          });

          setTimeout(() => {
            setOptions(null);
          }, 3000);
          navigate("/", { replace: true });
        }

        console.log("EMITTING JOIN")

        socketRef.current.emit(ACTIONS.JOIN, {
          projectId,
          username: uid,
        });

        // // Listening for joined event
        socketRef.current.on(
          ACTIONS.JOINED,
          ({ clients, username, socketId, projectId }) => {
            if (username !== uid) {
              console.log(`${username} joined`);
            }
            console.log("CLIENTS: " + clients);
            setClients(clients);
            console.log("clients ", clients);
            socketRef.current?.emit(ACTIONS.SYNC_CODE, {
              code: codeRef.current,
              socketId,
            });
          }
        );

        // Listening for disconnected
        socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
          setClients((prev) => {
            return prev.filter((client) => client.socketId !== socketId);
          });
          console.log("disconnected ", username);
          console.log(clients);
        });

        console.log("PROJECT ID CHANGES", pdata);
        if (pdata?.project.content) {
          editorRef.current?.setValue(pdata.project.content);
        }
      }
    }
    init();
    return () => {
      console.log("MAIN CLEANUP CALLED");
      socketRef.current?.disconnect();
      socketRef.current?.off(ACTIONS.JOINED);
      socketRef.current?.off(ACTIONS.DISCONNECTED);
      editorRef.current?.setValue("");
      editorRef.current = null;
    };
  }, [projectId , pdata]);

  const [lang, setLang] = useState("cmake");
  const [theme, setTheme] = useState("dracula");

  const ele = document.getElementsByClassName("CodeMirror")[0];

  if (loading || loading2) {
    console.log(data, pdata, "data not loaded");
    return <span class="loader"></span>
  }

  if (ele) {
    ele.style.fontSize = `${fsize}px`;
    console.log(ele);
  }

  if (!loading2 && !pdata && projectId != "-1") {
    console.log("NOT ACCESS THIS PAGE");

    return (
      <Image
        src={logo404}
        sx={{ marginTop: "10%" }}
        height={"40vh"}
        fit="contain"
      />
    );
  }

  return (
    <div className="cont">
      <div className="left">
        {projectId == "-1" ? (
          <>
            <Image mt="20%" src={logo} height="90vh"></Image>
          </>
        ) : (
          <LeftPane clients={clients} pid={projectId} data={pdata?.project} />
        )}
      </div>
      <div className="main">
        <div
          style={{
            maxHeight: "64px",
            margin: "8px 0px",
            backgroundColor: "hsl(231, 25%, 18%)",
            padding: "0px 4px",
          }}
        >
          <Grid gutter="sm" px="md" justify="left">
            <Grid.Col span={1}>
              {pdata && (
                <Center>
                  <Badge
                    variant="filled"
                    py="md"
                    mt="md"
                    color="green"
                    fullWidth
                  >
                    {pdata?.project.projectName}
                  </Badge>
                </Center>
              )}
            </Grid.Col>
            <Grid.Col span={2} ml="24px">
              <Text color="cyan">Language</Text>
              <Group spacing={"4px"}>
                <Button
                  size="sm"
                  compact
                  variant={`${lang === "cmake" ? "filled" : "outline"}`}
                  onClick={() => {
                    setLang("cmake");
                  }}
                >
                  C++
                </Button>
                <Button
                  size="sm"
                  compact
                  variant={`${lang === "javascript" ? "filled" : "outline"}`}
                  onClick={() => setLang("javascript")}
                >
                  JS
                </Button>
                <Button
                  size="sm"
                  compact
                  variant={`${lang === "python" ? "filled" : "outline"}`}
                  onClick={() => setLang("python")}
                >
                  Python
                </Button>
              </Group>
            </Grid.Col>

            <Grid.Col
              span={3}
              sx={{
                position: "relative",
                right: "32px",
              }}
            >
              <Text color="cyan">Theme</Text>
              <Group spacing={"4px"}>
                <Button
                  size="sm"
                  compact
                  variant={`${theme === "dracula" ? "filled" : "outline"}`}
                  onClick={() => setTheme("dracula")}
                >
                  Dracula
                </Button>
                <Button
                  size="sm"
                  compact
                  variant={`${
                    theme === "solarized light" ? "filled" : "outline"
                  }`}
                  onClick={() => setTheme("solarized light")}
                >
                  Solarized
                </Button>
                <Button
                  size="sm"
                  compact
                  variant={`${theme === "lucario" ? "filled" : "outline"}`}
                  onClick={() => setTheme("lucario")}
                >
                  Lucario
                </Button>
              </Group>
            </Grid.Col>

            <Grid.Col
              mr="md"
              span={1}
              sx={{
                position: "relative",
                right: "98px",
              }}
            >
              <Text color="cyan">Font Size</Text>
              <Group spacing={"4px"}>
                <Button
                  size="sm"
                  compact
                  variant="outline"
                  onClick={() => {
                    setFsize(Number(fsize) + 2);
                    console.log(fsize);
                  }}
                >
                  A+
                </Button>
                <Button
                  size="sm"
                  compact
                  variant="outline"
                  onClick={() => {
                    setFsize(Number(fsize) - 2);
                    console.log(fsize);
                  }}
                >
                  A-
                </Button>
              </Group>
            </Grid.Col>

            <Grid.Col span={1}></Grid.Col>

            <Grid.Col mx={0} span={1}>
              <Button
                my="sm"
                color="#4F78BA"
                onClick={(e) => {
                  handleSave(e);
                }}
              >
                SAVE
              </Button>
            </Grid.Col>

            <Grid.Col span={1}>
              <Button
                my="sm"
                loading={dis}
                onClick={(e) => {
                  handleCompile();
                }}
              >
                Compile{" "}
              </Button>
            </Grid.Col>
            <Grid.Col sx={{ position: "relative", left: "24px" }} span={1}>
              {dlink ? (
                <a
                  my="sm"
                  style={{
                    textDecoration: "none",
                    backgroundColor: "#40C057",
                    color: "white",
                    borderRadius: "4px",
                    marginTop: "12px",
                    display: "block",
                    padding: "8px",
                    width: "24px",
                    height: "18px",
                    paddingLeft: "12px",
                  }}
                  href={dlink.link}
                  download={dlink.fname}
                  onClick={handleDownload}
                >
                  <FaDownload />
                </a>
              ) : (
                <Button m="sm" onClick={handleDownload}>
                  Download
                </Button>
              )}
            </Grid.Col>
          </Grid>
        </div>
        {projectId == "-1" ? (
          <Def />
        ) : (
          <Editor
            editorRef={editorRef}
            content={pdata?.project.content}
            socketRef={socketRef}
            projectId={projectId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
            lang={lang}
            theme={theme}
          />
        )}
      </div>
      <div className="right">
        <RightPane setLang={setLang} lang={lang} data={data} />
      </div>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <Text color={output?.color} fw={600}>
            {output?.title}
          </Text>
        }
      >
        <Text>{output?.text}</Text>
      </Modal>
    </div>
  );
}

export default MainPage;

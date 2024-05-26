import React, { useState } from "react";
import { useEffect, useRef } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/theme/solarized.css";
import "codemirror/theme/lucario.css";

import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/cmake/cmake";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../../Actions.js";
import "./Editor.css";

function Editor({
  socketRef,
  projectId,
  onCodeChange,
  lang,
  theme,
  content = "",
  editorRef,
}) {
  console.log("EDItor", projectId, content);

  useEffect(() => {
    console.log("UE EDITOR.js", content);
    async function init() {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: lang, json: true },
          theme: theme,
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          value: content,
        }
      );

      if (content) {
        editorRef.current.setValue(content);
      }

      console.log(editorRef.current.getValue(), "content");
    }

    init();

    return () => {
      editorRef.current?.toTextArea();
      // console.log(editorRef);
      // console.log(editorRef.current?.options.mode.name);
    };
  }, [lang, theme, content]);

  useEffect(() => {
    console.log("EDITOR SOCKET REF CAHNGED", socketRef);
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        console.log("codeeeeee", code?.length);
        if ((code && code !== null) || code?.length > 0) {
          editorRef.current?.setValue(code);
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  if (editorRef.current) {
    editorRef?.current?.on("change", (instance, changes) => {
      console.log("CODE CHANGE", instance, changes);
      const { origin } = changes;
      const code = instance.getValue();
      console.log("USE EFFECT", code);
      onCodeChange(code);
      if (origin !== "setValue") {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, {
          projectId,
          code,
        });
      }
    });
  }

  return (
    <textarea id="realtimeEditor" style={{ minHeight: "100vh" }}></textarea>
  );
}

export default Editor;

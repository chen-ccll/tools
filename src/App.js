import "./styles.css";
import React, { useState, useEffect } from "react";
import ReactFileReader from "react-file-reader";
import mammoth from "mammoth";
import { saveAs } from "file-saver";
import data from "./data";
// import { read, utils } from "xlsx";
export default function App() {
  const [arr, setArr] = useState([]); //上传的配置文件
  const [res, setRes] = useState("");
  const handleFileRead = (files) => {
    if (arr.length == 0) {
      alert("请先上传配置文件");
      return;
    } else {
      const file = files[0];
      const reader = new FileReader();
      let filename = file.name?.split(".")[0];
      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        const result = await mammoth.extractRawText({ arrayBuffer });
        let str = result.value;
        let newStr = str;
        arr.forEach((item) => {
          newStr = newStr.replaceAll(item.in, item.out);
        });
        const blob = new Blob([newStr], { type: "text/plain" });
        saveAs(blob, `${filename}.txt`);
      };
      reader.readAsArrayBuffer(file);
    }
  };
  const handleFileRead2 = async (files) => {
    for (let i = 0; i < files.length; i++) {
      await handleSrtFile(files[i]);
    }
  };
  const handleSrtFile = async (file) => {
    const reader = new FileReader();
    let filename = file.name?.split(".")[0];
    reader.onload = async (event) => {
      try {
        let data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        let list = XLSX.utils.sheet_to_json(worksheet, {
          header: ["time", "cnText", "enText"],
        });
        list.splice(0, 1);
        let str = "";
        list.forEach((row, index) => {
          let enText = row.enText ? `<b>${row.enText}</b>` : "";
          str = str + `${index + 1}\n${row.time || ""}\n${enText}\n\n`;
        });
        // console.log(str);
        const blob = new Blob([str], { type: "text/plain" });
        saveAs(blob, `${filename}.srt`);
      } catch (error) {
        alert("格式可能有误，转换失败");
      }
    };
    reader.readAsArrayBuffer(file);
  };
  return (
    <div className="App">
      <div>
        <div style={{ color: "#f50" }}>注意：请上传.xlsx文件</div>

        <ReactFileReader
          handleFiles={handleFileRead2}
          fileTypes=".xlsx"
          multipleFiles={true}
        >
          <button style={{ marginTop: 20 }} className="btn">
            点击上传.xlsx文件
          </button>
        </ReactFileReader>
        {/* <div style={{ marginTop: 20 }}>
          1.第一步：选择配置文件 仅支持.json文件格式
        </div>

        <ReactFileReader handleFiles={handleFileRead} fileTypes=".docx">
          <button className="btn" style={{ marginTop: 20 }}>
            点击上传源文件
          </button>
        </ReactFileReader>
        <div style={{ marginTop: 20 }}>
          2.第二步：选择要转换的文件 仅支持.docx文件格式
        </div> */}
      </div>
    </div>
  );
}

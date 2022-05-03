import "./App.css";
import React from "react";
import axios from 'axios';
import { InfinitySpin } from "react-loader-spinner";

class App extends React.Component {
  state = {
    file: null,
    base64URL: "",
    ocrRunning: false,
    ocrEnabled: false,
    ocr: [],
    meds: [],
    neverRan: true
  };

  getBase64 = file => {
    return new Promise(resolve => {
      let fileInfo;
      let baseURL = "";
      // Make new FileReader
      let reader = new FileReader();

      // Convert the file to base64 text
      reader.readAsDataURL(file);

      // on reader load somthing...
      reader.onload = () => {
        // Make a fileInfo Object
        console.log("Called", reader);
        baseURL = reader.result;
        console.log(baseURL);
        resolve(baseURL);
      };
      console.log(fileInfo);
    });
  };

  handleFileInputChange = e => {
    
    console.log(e.target.files[0]);
    let { file } = this.state;

    file = e.target.files[0];

    this.getBase64(file)
      .then(result => {
        file["base64"] = result;
        console.log("File Is", file);
        this.setState({
          base64URL: result,
          file
        });
      })
      .catch(err => {
        console.log(err);
      });

    this.setState({
      file: e.target.files[0]
    });
  };

  handleFileUpload = () => {
    this.setState({ denoising: true, neverRan: false })
    const data = {
      base64: this.state.base64URL
    }
    axios.post('http://127.0.0.1:5000/setimg', data).then(res => {
      console.log(res)
      this.handleOCR()
    })
    
  }

  handleOCR = () => {
    this.setState({ocrRunning : true})
    this.setState({ ocr: '' })
    axios.get('http://127.0.0.1:5000/ocr').then(res => res.data).then(data => {
      console.log(data)
      this.setState({ ocr: data[0], meds:data[1], ocrRunning: false})
    })
  }

  handleRadio = () => {
    this.setState({'ocrEnabled' : !this.state.ocrEnabled})
  }


  render() {
    return (
      <div className="App font-light flex flex-col items-center">
        <div className="app-header mt-10 text-3xl">CSD 300 Project</div>
        <div className="app-header mt-6 text-3xl">Doctor's Prescription Recognition System</div>
        <div className="main-container w-[90%] flex justify-center gap-[200px] mt-10">
          <div className="input-container w-[40%] h-min-[500px] mt-20 flex flex-col justify-center items-center">
            <div className="og-img-container w-[300px]">
              {this.state.base64URL && <img src={this.state.base64URL} alt='Original Image' className="shadow-xl" />}
            </div>
            <>
              <br />
              <input className="w-[96px] hidden" type="file" name="Image" id="img" onChange={this.handleFileInputChange} />
              <label for="img" className="border bg-black text-white px-3 py-1 shadow-md hover:bg-red-300 transition hover:text-black cursor-pointer">Upload Prescription</label>
            </>
            <br />
            <div className="checkBox-container mt-5 border px-3 py-1 border-black">
              <input type="checkbox" value='OCR' name='OCR' onChange={e => this.handleRadio(e)} />
              <label className="ml-2" htmlFor="OCR">Show Text</label>
            </div>
            <div className={`submit-btn bg-blue-300 hover:bg-green-300 px-3 py-1 cursor-pointer transition mt-5`} onClick={this.handleFileUpload}>
              {this.state.ocrRunning === true ? 'Running' : 'Run'}
            </div>
          </div>
          {this.state.ocrEnabled && <div className={`input-container w-[40%] overflow-y-scroll h-[300px] mt-20 flex flex-col items-center p-5 ${this.state.ocr.length === 0 ? '' : 'shadow-md'}`}>
          {this.state.ocr.length !== 0 ? <div className="text-md mb-5">Detected Text</div> : <></>}
            {this.state.ocrRunning && <InfinitySpin color="red" />}
            {this.state.ocr.length !== 0 ? <div className="text-2xl">{this.state.ocr.map(ocr => <div className="ocr-name">{ocr.toLowerCase()}</div>)}</div> : <></>}
          </div>}
          {!this.state.neverRan && <div className={`input-container w-[40%] overflow-y-scroll h-[300px] mt-20 flex flex-col items-center p-5 ${this.state.ocr.length === 0 ? '' : 'shadow-md'}`}>
          {this.state.ocr.length !== 0 ? this.state.meds.length !== 0 ? <div className="text-md mb-5">Medicines Found</div> : <>Medicines Not Found</> : ''}
            {this.state.ocrRunning && <InfinitySpin color="red" />}
            {!this.state.ocrRunning && this.state.meds.length !== 0 ? <div className="text-2xl">{this.state.meds.map((med, index) => <div className="med-name">{index+1}. {med.toLowerCase()}</div>)}</div> : <></>}
          </div>}
        </div>
      </div>
    );
  }
}

export default App;

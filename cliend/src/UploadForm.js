import { gql, useMutation } from "@apollo/client";
import React from "react";

const UPLOAD_FILE = gql`
  mutation uploadFile($file: Upload!) {
    uploadFile(file: $file) {
      url
    }
  }
`;

const UploadForm = () => {
  const [uploadFile] = useMutation(UPLOAD_FILE, {
    onCompleted: (data) => {
      console.log(data);
    },
  });
  const handleCHange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadFile({ variables: { file } });
  };
  return (
    <div>
      <h1>File Upload</h1>
      <input type="file" name="file" onChange={handleCHange} />
    </div>
  );
};

export default UploadForm;

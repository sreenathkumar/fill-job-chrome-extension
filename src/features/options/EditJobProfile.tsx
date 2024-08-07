import { Button } from "@mui/joy";
import { Box, Grid, Paper, Chip, SvgIcon, Avatar, Alert, Link } from "@mui/material";
import React, { useEffect, useState } from "react";
import { isLoggedIn } from "../popup/App";
import { formStructure } from "../../utils/formStructure";
import FormGroupItem from "../../components/ui/FormGroupItem";
import FormGroup from "../../components/ui/FormGroup";
import { app } from "../../api/auth";
import { jobProfileFormInfo } from "../../utils/formInfo";
import DependentFields from "./ui/DependentFields";
import styled from "@emotion/styled";
import axios from "axios";
import { checkValidImage, makeBase64 } from "../../utils/utilitiesFn";
import { toast } from "react-toastify";
import DownloadBtn from "./DownloadBtn";

const VisuallyHiddenInput = styled("input")`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
  name: "generalProfileImage";
`;
function EditJobProfile() {
  const [profileData, setProfileData] = useState<
    jobProfileDataType | undefined
  >();
  const [previewProPhoto, setPreviewProPhoto] = useState<string | undefined>();
  const [previewProSignature, setPreviewProSignature] = useState<
    string | undefined
  >();
  const [photoUploadError, setPhotoUploadError] = useState<
    string | undefined
  >();
  const [signatureUploadError, setSignatureUploadError] = useState<
    string | undefined
  >();

  const user = app.currentUser; //chekcing for user
  if (user) {
    const token = localStorage.getItem("token"); // get token from local storage
    if (token !== null) {
      const parserdToken = JSON.parse(token); // parse token
      if (parserdToken.expiresAt > Date.now()) {
        // check if token is valid
        isLoggedIn.value = true; // set logged in to true
      }
    }
  }
  console.log(user?.id);

  // Fetch the data from the server
  const getData = async () => {
    try {
      const res = await app.currentUser?.functions.callFunction(
        "getJobProfileData"
      );
      if (res.jobData) {
        setProfileData({ ...res.jobData });
      } else {
        console.log("No jobData in the response");
      }
    } catch (error) {
      console.error("Error fetching job profile data:", error);
      // Handle the error as needed
    }
    try {
      const { data } = await axios.get(
        `${process.env.PROD_API_URL}/api/photos`,
        {
          params: { id: user?.id },
        }
      );
      if (data) {
        setPreviewProPhoto(makeBase64(data.photo));
        setPreviewProSignature(makeBase64(data.signature));
      }
    } catch (error) {
      console.log(error);
    }
  };

  //handle text field submission
  const handleTextSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    console.log("text form submitted");

    event.preventDefault();
    const data = new FormData(event.currentTarget);
    let updatedData = { ...Object.fromEntries(data) };
    if (!updatedData.same_as_present) {
      updatedData.same_as_present = "false";
    } else if (!updatedData.if_applicable_mas) {
      updatedData.if_applicable_mas = "false";
    }
    console.log("text data: ", updatedData);

    if (profileData) {
      updatedData = { ...profileData, ...updatedData };
    }
    const updateToast = toast.loading("Updating data...", { autoClose: false });
    //updating job profile data
    try {
      user?.functions.callFunction("updateJobData", updatedData).then((res) => {
        if (res.status === "success") {
          setProfileData({ ...res.jobData });
          //alert('Data updated successfully');
          toast.update(updateToast, {
            render: "Data updated successfully",
            type: "success",
            autoClose: 2000,
            isLoading: false,
          });
        } else {
          //alert('Something went wrong. Please reload the page and try again');
          toast.update(updateToast, {
            render:
              "Something went wrong. Please reload the page and try again",
            type: "error",
            autoClose: 2000,
            isLoading: false,
          });
        }
      });
    } catch (error) {
      alert(error);
    }
  };

  //handle file submission
  const handleFileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("file form submitted");

    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.append("id", user?.id || "");
    try {
      const res = await axios.post(
        `${process.env.PROD_API_URL}/api/photos/upload`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("file submit res: ", res);
    } catch (error) {
      alert(`Error uploading files: ${error}`);
    }
  };

  //handle submit double form
  const handleSubmit = (event: React.MouseEvent) => {
    const textForm = document.getElementById("text-form");
    const fileForm = document.getElementById("file-form");
    if (textForm && fileForm) {
      handleFileSubmit({
        preventDefault: () => { },
        currentTarget: fileForm,
      } as React.FormEvent<HTMLFormElement>);
      handleTextSubmit({
        preventDefault: () => { },
        currentTarget: textForm,
      } as React.FormEvent<HTMLFormElement>);
    }
  };

  //handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target?.files as FileList;
    const name = e.target?.name;

    if (name === "photo") {
      let validFile = await checkValidImage(selectedFile?.[0], 300, 300);
      if (validFile.status === "success") {
        setPreviewProPhoto(URL.createObjectURL(selectedFile?.[0]));
        return;
      } else {
        setPhotoUploadError(validFile.message);
      }
    } else if (name === "signature") {
      let validFile = await checkValidImage(selectedFile?.[0], 300, 80);
      if (validFile.status === "success") {
        setPreviewProSignature(URL.createObjectURL(selectedFile?.[0]));
        return;
      } else {
        setSignatureUploadError(validFile.message);
      }
    }
  };

  // Use useEffect to call getData when needed
  useEffect(() => {
    getData(); // Call the getData from server
  }, []);

  return (
    <Box display={"flex"} flexDirection={"column"}>
      <Box
        component="form"
        onSubmit={handleTextSubmit}
        id="text-form"
        sx={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}
      >
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          padding={"1.5rem"}
          borderRadius={"10px"}
          elevation={3}
          component={Paper}
          square
        >
          <Chip
            label={"Basic Information"}
            variant="outlined"
            sx={{ marginBottom: "2.5rem" }}
          />
          <Box display={"flex"} flexDirection={"column"} gap={"1rem"}>
            {formStructure.basic_field.map((item, itIndex) => {
              return (
                <FormGroup key={itIndex}>
                  {item.fields?.map((field, index) => {
                    return (
                      <FormGroupItem
                        field={field}
                        key={index}
                        value={profileData ? profileData[field.id] : ""}
                        fieldInfo={jobProfileFormInfo[field.id]}
                      />
                    );
                  })}
                </FormGroup>
              );
            })}
          </Box>
        </Grid>
        <Grid container margin={"0px"} sx={{ gap: "2.5rem" }}>
          <Grid
            item
            xs
            padding={"1.5rem"}
            borderRadius={"10px"}
            elevation={3}
            component={Paper}
            square
          >
            <Chip
              label={"Present Address"}
              variant="outlined"
              sx={{ marginBottom: "2.5rem" }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                flexGrow: "1",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {formStructure.present_address_field.map((item, itIndex) => {
                return (
                  <FormGroupItem
                    field={item}
                    key={itIndex}
                    value={profileData ? profileData[item.id] : ""}
                    fieldInfo={jobProfileFormInfo[item.id]}
                  />
                );
              })}
            </Box>
          </Grid>
          <Grid
            item
            xs
            padding={"1.5rem"}
            borderRadius={"10px"}
            elevation={3}
            component={Paper}
            square
          >
            <Chip
              label={"Permanent Address"}
              variant="outlined"
              sx={{ marginBottom: "2.5rem" }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                flexGrow: "1",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <DependentFields
                name="same_as_present"
                id="same_as_present"
                check={profileData?.same_as_present === "true" ? true : false}
                data={profileData}
              />
            </Box>
          </Grid>
        </Grid>
        <Grid container margin={"0px"} sx={{ gap: "2.5rem" }}>
          <Grid
            item
            xs
            padding={"1.5rem"}
            borderRadius={"10px"}
            elevation={3}
            component={Paper}
            square
          >
            <Chip
              label={"SSC/Equivalent Level"}
              variant="outlined"
              sx={{ marginBottom: "2.5rem" }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                flexGrow: "1",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {formStructure.ssc_field.map((item, itIndex) => {
                return (
                  <FormGroupItem
                    field={item}
                    key={itIndex}
                    value={profileData ? profileData[item.id] : ""}
                    fieldInfo={jobProfileFormInfo[item.id]}
                  />
                );
              })}
            </Box>
          </Grid>
          <Grid
            item
            xs
            padding={"1.5rem"}
            borderRadius={"10px"}
            elevation={3}
            component={Paper}
            square
          >
            <Chip
              label={"HSC/Equivalent Level"}
              variant="outlined"
              sx={{ marginBottom: "2.5rem" }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                flexGrow: "1",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {formStructure.hsc_field.map((item, itIndex) => {
                return (
                  <FormGroupItem
                    field={item}
                    key={itIndex}
                    value={profileData ? profileData[item.id] : ""}
                    fieldInfo={jobProfileFormInfo[item.id]}
                  />
                );
              })}
            </Box>
          </Grid>
        </Grid>
        <Grid container margin={"0px"} sx={{ gap: "2.5rem" }}>
          <Grid
            item
            xs
            padding={"1.5rem"}
            borderRadius={"10px"}
            elevation={3}
            component={Paper}
            square
          >
            <Chip
              label={"Honors/Equivalent"}
              variant="outlined"
              sx={{ marginBottom: "2.5rem" }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                flexGrow: "1",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {formStructure.honors_field.map((item, itIndex) => {
                return (
                  <FormGroupItem
                    field={item}
                    key={itIndex}
                    value={profileData ? profileData[item.id] : ""}
                    fieldInfo={jobProfileFormInfo[item.id]}
                  />
                );
              })}
            </Box>
          </Grid>
          <Grid
            item
            xs
            padding={"1.5rem"}
            borderRadius={"10px"}
            elevation={3}
            component={Paper}
            square
          >
            <Chip
              label={"Masters/Equivalent"}
              variant="outlined"
              sx={{ marginBottom: "2.5rem" }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                flexGrow: "1",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <DependentFields
                name="if_applicable_mas"
                id="if_applicable_mas"
                check={profileData?.if_applicable_mas === "true" ? true : false}
                data={profileData}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box
        component="form"
        onSubmit={handleFileSubmit}
        id="file-form"
        my={"2.5rem"}
      >
        <Grid
          container
          padding={"1.5rem"}
          borderRadius={"10px"}
          rowGap={"1rem"}
          elevation={3}
          component={Paper}
          square
        >
          <Box sx={{ display: "flex", gap: "1rem" }} width={"100%"}>
            <Avatar variant="square" sx={{ width: "100px", height: "100px" }}>
              <img
                src={previewProPhoto}
                alt=""
                width={"100%"}
                height={"100%"}
              />
            </Avatar>
            <Button
              component="label"
              tabIndex={-1}
              variant="outlined"
              fullWidth
              startDecorator={
                <SvgIcon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                    />
                  </svg>
                </SvgIcon>
              }
            >
              Upload Photo (must be 300px x 300px)
              {photoUploadError && (
                <Alert severity="error">{photoUploadError}</Alert>
              )}
              <VisuallyHiddenInput
                type="file"
                name="photo"
                onChange={handleFileUpload}
              />
            </Button>
            <DownloadBtn image={previewProPhoto || ""} item_name="photo" />
          </Box>
          <Box sx={{ display: "flex", gap: "1rem" }} width={"100%"}>
            <Avatar variant="square" sx={{ width: "300px", height: "80px" }}>
              <img
                src={previewProSignature}
                alt=""
                width={"100%"}
                height={"100%"}
              />
            </Avatar>
            <Button
              component="label"
              tabIndex={-1}
              variant="outlined"
              fullWidth
              startDecorator={
                <SvgIcon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                    />
                  </svg>
                </SvgIcon>
              }
            >
              Upload Signature (must be 300px x 80px).
              {signatureUploadError && (
                <Alert severity="error">{signatureUploadError}</Alert>
              )}
              <VisuallyHiddenInput
                type="file"
                name="signature"
                onChange={handleFileUpload}
              />
            </Button>
            <DownloadBtn image={previewProSignature || ""} item_name="signature" />
          </Box>
        </Grid>
      </Box>
      <Box width={"100%"}>
        <Button onClick={handleSubmit} sx={{ width: "100%" }}>
          Update data
        </Button>
      </Box>
    </Box>
  );
}

export default EditJobProfile;

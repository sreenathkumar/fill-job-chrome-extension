interface tokenDataType {
   data: string
   expires: number
}

interface tokenType {
   access_token: tokenDataType,
   refresh_token: tokenDataType,
}

interface btnType {
   title: string,
   task: Function,
}

interface generalProfileDataType {
   firstName: string,
   lastName: string,
   bio: string,
   img: string,
}

interface formInputFieldType {
   type: string, id: string, label: string,
}

interface jobProfileDataType {
   [name: string]: string,
   name_bn: string,
   father: string,
   father_bn: string,
   mother: string,
   mother_bn: string,
   dob: string,
   religion: string,
   gender: string,
   nid: string,
   nid_no: string,
   breg: string,
   breg_no: string,
   passport: string,
   marital_status: string,
   mobile: string,
   confirm_mobile: string,
   email: string,
   quota: string,
   dep_status: string,
   present_careof: string,
   present_village: string,
   present_district: string,
   present_upazila: string,
   present_post: string,
   present_postcode: string,
   same_as_present: string,
   permanent_careof: string,
   permanent_village: string,
   permanent_district: string,
   permanent_upazila: string,
   permanent_post: string,
   permanent_postcode: string,
   ssc_exam: string,
   ssc_roll: string,
   ssc_group: string,
   ssc_board: string,
   ssc_result_type: string,
   ssc_result: string,
   ssc_year: string,
   hsc_exam: string,
   hsc_roll: string,
   hsc_group: string,
   hsc_board: string,
   hsc_result_type: string,
   hsc_result: string,
   hsc_year: string,
   gra_exam: string,
   gra_institute: string,
   gra_year: string,
   gra_subject: string,
   gra_result_type: string,
   gra_result: string,
   gra_duration: string,
   if_applicable_mas: string,
   mas_exam: string,
   mas_institute: string,
   mas_year: string,
   mas_subject: string,
   mas_result_type: string,
   mas_duration: string
}

interface profileDataType {
   general_profile?: generalProfileDataType,
   job_profile?: 'jobProfileDataType',
}
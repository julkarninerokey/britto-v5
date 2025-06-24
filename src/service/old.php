<?php
defined('BASEPATH') or exit('No direct script access allowed');

class App extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();

        $this->load->database();

    }

    public function index()
    {
        echo 'App API Controller is working NOW';
        $appDB = $this->load->database('app', TRUE);
        $dairydb = $this->load->database('dairy', TRUE);
         echo $appDB->query("SELECT * FROM loginFailedHistory ")->num_rows();
        // echo $dairydb->query("SELECT * FROM `designation` ")->num_rows();

    }

    public function getSyllabus(){
        $appDB = $this->load->database('app', TRUE);

        $reg = $this->input->get('reg');

        $isLogin = $this->checkLoginStatus($reg);

        if ($isLogin) {
            $get = $appDB->query("SELECT subject_id FROM `student_info` WHERE student_info.reg_num = '$reg' AND student_info.status = 1");

            if ($get->num_rows() >= 1) {

                $subject_id = $get->row()->subject_id;

                $syllabus = $appDB->query("SELECT * FROM syllabus WHERE subject_id = '$subject_id' AND status = 1 ");

                $response = [
                    'status' => 200,
                    'syllabus' => $syllabus->result(),
                ];
                $this->output->set_content_type('application/json')->set_output(json_encode($response));
                return;
            } else {
                $response = [
                    'status' => 501,
                    'message' => 'Access Denied. Please Contact Room 301.',
                    'data' => $reg
                ];
                $this->output->set_content_type('application/json')->set_output(json_encode($response));
                return;
            }
        } else {
            $response = [
                'status' => 501,
                'message' => 'Access Denied. Please Contact Room 301.',
                'data' => $reg
            ];
            $this->output->set_content_type('application/json')->set_output(json_encode($response));
            return;
        }
    }

    public function addToNoticeViewHistory(){
        $appDB = $this->load->database('app', TRUE);

        $reg = $this->input->get('reg');
        $token = $this->input->get('token');
        $noticeId = $this->input->get('noticeId');

        if($reg && $token && $noticeId){
            $appDB->query("INSERT INTO `noticeViewHistory`(`reg`, `token`, `noticeId`) VALUES ('$reg' , '$token', '$noticeId') ");
        }
    }
    public function addNotice(){

        $appDB = $this->load->database('app', TRUE);

        $text = $this->input->get('text');
        $desc = $this->input->get('desc');
        $file = $this->input->get('file');
        $typeId = $this->input->get('typeId');
        $bodyId = $this->input->get('bodyId');
        $user = $this->input->get('user');

        if($text && $desc && $typeId && $bodyId && $user){
            $insert = $appDB->query("INSERT INTO `notice`( `text`, `description`, `file`, `typeId`, `body_id`, `createdBy` ) VALUES ('$text', '$desc','$file','$typeId', '$bodyId','$user')");
            if($insert){
                $response = [
                    'status' => 200,
                    'message' => 'Notice Added.'
                ];
                $this->output->set_content_type('application/json')->set_output(json_encode($response));
                return;
            }else{
                $response = [
                    'status' => 400,
                    'message' => 'Insert Failed'
                ];
                $this->output->set_content_type('application/json')->set_output(json_encode($response));
                return;
            }
        }else{
            $response = [
                'status' => 300,
                'message' => 'Data Missing',
                'data' => $_GET
            ];
            $this->output->set_content_type('application/json')->set_output(json_encode($response));
            return;
        }

    }

    public function getHallData()
    {
        $appDB = $this->load->database('app', TRUE);
        $address = $this->load->database('address', TRUE);
        $dairydb = $this->load->database('dairy', TRUE);


        $reg = $this->input->get('reg');

        $isLogin = $this->checkLoginStatus($reg);

        if ($isLogin) {
            $get = $appDB->query("SELECT subject_id, session, hall_id FROM `student_info` WHERE student_info.reg_num = '$reg' AND student_info.status = 1");

            if ($get->num_rows() >= 1) {

                $body_code = $get->row()->hall_id;
                $subject_id = $get->row()->subject_id;
                $session = $get->row()->session;

                $getDept = $dairydb->query("SELECT id, name, attachment, estyr,head, designation, description as history, contact_info, mission_vision, head_id, bodyid FROM `body` WHERE body_code = '$body_code' ");

                $bodyID = $getDept->row()->bodyid;
                $body_id = $getDept->row()->id;
                $hallID = $dairydb->query("SELECT id  FROM `employee_directory_setting` WHERE `body_id` = '$body_id' ")->row()->id;

                $teachers = $dairydb->query("SELECT employee_directory_info.id, employee_directory_info.EmpType, employee_directory_info.OfficeID, employee_directory_info.DesignationID, employee_directory_info.Mobile_1 as mobile, employee_directory_info.display_position, employee_directory_info.EmpID, employees.email, employees.emp_name, employees.image_location, employees.image, designation.designation, employees.designation_id FROM `employee_directory_info` JOIN employees ON employees.emp_id = employee_directory_info.EmpID JOIN designation ON designation.desigid = employees.designation_id WHERE `OfficeID` = '$hallID' AND employees.emp_id != '' AND employee_directory_info.is_active = 1 GROUP BY emp_id ORDER BY `employee_directory_info`.`display_position` ASC;");

                $students = $appDB->query("SELECT name_en, chobi, hall_name FROM student_info WHERE hall_id = '$body_code' AND subject_id = '$subject_id' AND session = '$session' AND status = 1 ");

                $response = [
                    'status' => 200,
                    'data' => $getDept->result(),
                    'subject_id' => $body_code,
                    'staff' => $teachers->result(),
                    'student' => $students->result(),
                ];
                $this->output->set_content_type('application/json')->set_output(json_encode($response));
                return;
            } else {
                $response = [
                    'status' => 501,
                    'message' => 'Access Denied. Please Contact Room 301.',
                    'data' => $reg
                ];
                $this->output->set_content_type('application/json')->set_output(json_encode($response));
                return;
            }
        } else {
            $response = [
                'status' => 501,
                'message' => 'Access Denied. Please Contact Room 301.',
                'data' => $reg
            ];
            $this->output->set_content_type('application/json')->set_output(json_encode($response));
            return;
        }

    }

    public function getDeptData()
{
    $appDB = $this->load->database('app', TRUE);
    $address = $this->load->database('address', TRUE);
    $dairydb = $this->load->database('dairy', TRUE);


    $reg = $this->input->get('reg');

    $isLogin = $this->checkLoginStatus($reg);

    if ($isLogin) {
        $get = $appDB->query("SELECT subject_id, session FROM `student_info` WHERE student_info.reg_num = '$reg' AND student_info.status = 1");

        if ($get->num_rows() >= 1) {

            $body_code = $get->row()->subject_id;
            $session = $get->row()->session;

            $photo = "https://v2.result.du.ac.bd/assets/assets/Britto/deptLogo.png";

            $getDept = $dairydb->query("SELECT name, attachment, estyr,head, designation, history, contact_info, mission_vision, head_id, bodyid FROM `body` WHERE body_code = '$body_code' ");

            $bodyID = $getDept->row()->bodyid;

            $teachers = $dairydb->query("SELECT employees.id, employees.bodyid, employees.emp_name, employees.image_location, employees.image,employee_directory_info.mobile_1 as mobile, employees.email, employees.emp_id, employees.designation_id, employee_directory_info.EmpType, employee_directory_info.display_position, employee_directory_info.DesignationID, designation.designation FROM `employee_directory_info` JOIN `employees` ON employee_directory_info.EmpID = employees.emp_id JOIN designation ON employees.designation_id = designation.desigid WHERE employees.bodyid = '$bodyID' AND employees.emp_id != '' AND employee_directory_info.is_active = 1 GROUP BY emp_id ORDER BY `employee_directory_info`.`display_position` ASC");

            $students = $appDB->query("SELECT name_en, chobi, hall_name FROM student_info WHERE subject_id = '$body_code' AND session = '$session' AND status = 1 ");

            $response = [
                'status' => 200,
                'data' => $getDept->result(),
                'subject_id' => $body_code,
                'chobi' => $photo,
                'staff' => $teachers->result(),
                'student' => $students->result(),
            ];
            $this->output->set_content_type('application/json')->set_output(json_encode($response));
            return;
        } else {
            $response = [
                'status' => 501,
                'message' => 'Access Denied. Please Contact Room 301.',
                'data' => $reg
            ];
            $this->output->set_content_type('application/json')->set_output(json_encode($response));
            return;
        }
    } else {
        $response = [
            'status' => 501,
            'message' => 'Access Denied. Please Contact Room 301.',
            'data' => $reg
        ];
        $this->output->set_content_type('application/json')->set_output(json_encode($response));
        return;
    }


}

    public function getProfileData()
    {
        $appDB = $this->load->database('app', TRUE);
        $address = $this->load->database('address', TRUE);


        $reg = $this->input->get('reg');

        $isLogin = $this->checkLoginStatus($reg);

        if ($isLogin) {
            $get = $appDB->query("SELECT student_info.*, religions.name as dhormo FROM `student_info` JOIN religions ON religions.id =student_info.religion WHERE student_info.reg_num = '$reg' AND student_info.status = 1");

            if ($get->num_rows() >= 1) {

                $dist = $get->row()->perm_dist;
                $divi = $get->row()->perm_division;
                $thana = $get->row()->perm_thana;

                $districts = $address->query("SELECT name FROM `districts` WHERE  id = '$dist' ")->row()->name;
                $divisions = $address->query("SELECT name FROM `divisions` WHERE  id = '$divi' ")->row()->name;
                $upazilas = $address->query("SELECT name FROM `upazilas` WHERE  id = '$thana' ")->row()->name;

                $add = $upazilas . "," . $districts . "," . $divisions;

                $response = [
                    'status' => 200,
                    'data' => $get->result(),
                    'address' => $add
                ];
                $this->output->set_content_type('application/json')->set_output(json_encode($response));
                return;
            } else {
                $response = [
                    'status' => 501,
                    'message' => 'Access Denied. Please Contact Room 301.',
                    'data' => $reg
                ];
                $this->output->set_content_type('application/json')->set_output(json_encode($response));
                return;
            }
        } else {
            $response = [
                'status' => 501,
                'message' => 'Access Denied. Please Contact Room 301.',
                'data' => $reg
            ];
            $this->output->set_content_type('application/json')->set_output(json_encode($response));
            return;
        }


    }

    public function signup()
    {
        $reg = $this->input->get('reg');
        $pass = $this->input->get('pass');
        $netInfo = $this->input->get('netInfo');
        $deviceName = $this->input->get('deviceName');
        $lang = $this->input->get('lang');
        $statusBarHeight = $this->input->get('statusBarHeight');
        $sessionId = $this->input->get('sessionId');
        $ipAddress = $this->input->get('ipAddress');
        $device = $this->input->get('device');
        $studentName = $this->input->get('studentName');
        $studentNamebn = $this->input->get('studentNamebn');
        $fatherName = $this->input->get('fatherName');
        $motherName = $this->input->get('motherName');
        $phone = $this->input->get('phone');
        $email = $this->input->get('email');
        $dateOfBirth = $this->input->get('dateOfBirth');
        $bloodGroup = $this->input->get('bloodGroup');
        $religion = $this->input->get('religion');
        $presentAddress = $this->input->get('presentAddress');
        $presentUnion = $this->input->get('presentUnion');
        $permanentAddress = $this->input->get('permanentAddress');
        $permanentThana = $this->input->get('permanentThana');
        $permanentDistrict = $this->input->get('permanentDistrict');
        $permanentDivision = $this->input->get('permanentDivision');
        $hallName = $this->input->get('hallName');
        $deptName = $this->input->get('deptName');
        $classRoll = $this->input->get('classRoll');
        $year = $this->input->get('year');
        $semester = $this->input->get('semester');
        $receivedPhoto = $this->input->get('receivedPhoto');
        $session = $this->input->get('session');
        $deptId = $this->input->get('deptId');
        $hallId = $this->input->get('hallId');
        $ticket = $this->input->get('ticket');
        $osVersion = $this->input->get('osVersion');
        $gender = $this->input->get('gender');

        $appDB = $this->load->database('app', TRUE);


        if ($reg && $pass && $studentName && $studentNamebn && $phone && $email && $dateOfBirth && $bloodGroup && $presentAddress && $permanentAddress && $hallName && $deptName && $deptId && $hallId && $receivedPhoto) {

            $checkUser = $appDB->query("SELECT id FROM users WHERE reg_num = $reg ");

            if ($checkUser->num_rows() >= 1) {
                $this->errorReport('User Exist', 'This user already existing in user talbe', $reg);
                $response = [
                    'status' => 500,
                    'message' => 'Something Went Wrong. Please Contact Room 301.(EXT)',

                ];
                $this->output->set_content_type('application/json')->set_output(json_encode($response));
                return;
            } else {
                $userID = 0;
                $studentID = 0;

                $queryResult = $appDB->query("INSERT INTO `users` (`reg_num`, `password`, `ticket`) VALUES ('$reg', '$pass', '$ticket')");

                if ($queryResult === false) {
                    throw new Exception('Error executing the SQL query: ' . $appDB->error);
                }

                $userID = $appDB->insert_id();
                $sessionID = substr($reg, 0, 4);

                if ($userID) {
                    $queryResult = $appDB->query("INSERT INTO `student_info`(`userId`, `reg_num`, `name_bn`, `name_en`, `father_name`, `mother_name`, `religion`, `present_add`, `perm_add`, `perm_union`, `perm_thana`, `perm_dist`, `perm_division`, `dob`, `blood_group`, `hall_name`, `dept_name`, `hall_id`, `subject_id`, `chobi`,  `phone`, `email`, `gender`, `session`) VALUES ('$userID','$reg','$studentNamebn','$studentName','$fatherName','$motherName','$religion','$presentAddress','$permanentAddress','$presentUnion','$permanentThana','$permanentDistrict','$permanentDivision','$dateOfBirth','$bloodGroup','$hallName','$deptName','$hallId','$deptId','$receivedPhoto','$phone','$email','$gender','$sessionID' )");

                    if ($queryResult === false) {
                        $this->errorReport('RIE', 'Error on STUDENT Insert at Signup Function', $reg . $phone);
                        throw new Exception('Error executing the SQL query: ' . $appDB->error);
                    }

                    $studentID = $appDB->insert_id();

                    if ($studentID) {

                        $queryResulct = $appDB->query("INSERT INTO `enrollInfo`(`student_id`, `classRoll`, `year`, `semester`, `session` ) VALUES ('$studentID','$classRoll','$year','$semester','$session')");

                        if ($queryResulct === false) {
                            $this->errorReport('SIF', 'Error on ENROLL Insert at Signup Function', $reg . $phone);
                            throw new Exception('Error executing the SQL query: ' . $appDB->error);

                            $this->errorReport('SIF', 'Error on STUDENT Insert at Signup Function', $reg . $phone);
                            $response = [
                                'status' => 500,
                                'message' => 'Something Went Wrong. Please Contact Room 301.(Code: EXT)',

                            ];
                            $this->output->set_content_type('application/json')->set_output(json_encode($response));
                            return;
                        } else {

                            $queryResult = $appDB->query("INSERT INTO `loginSuccessHistory`(`reg`, `pass`, `netInfo`,  `device`,`deviceName`,`osVersion`, `lang`, `statusBarHeight`, `sessionId`, `ipAddress`,`comment`) VALUES ('$reg','$pass','$netInfo','$device','$deviceName','$osVersion', '$lang','$statusBarHeight','$sessionId','$ipAddress','New') ");

                            if ($queryResult === false) {
                                $this->errorReport('SIF', 'Error on loginSuccessHistory Insert at Signup Function', $reg . $phone);
                                throw new Exception('Error executing the SQL query: ' . $appDB->error);

                                $this->errorReport('SIF', 'Error on STUDENT Insert at Signup Function', $reg . $phone);
                                $response = [
                                    'status' => 500,
                                    'message' => 'Something Went Wrong. Please Contact Room 301.(Code: EXT)',

                                ];
                                $this->output->set_content_type('application/json')->set_output(json_encode($response));
                                return;
                            } else {
                                $token = $appDB->insert_id();

                                $response = [
                                    'status' => 200,
                                    'token' => $token,
                                    'name' => $studentName,
                                    'hall' => $hallName,
                                    'dept' => $deptName,
                                    'photo' => $receivedPhoto,

                                ];
                                $this->output->set_content_type('application/json')->set_output(json_encode($response));
                                return;
                            }
                        }
                    } else {
                        $this->errorReport('SIF', 'Error on STUDENT Insert at Signup Function', $reg . $phone);
                        $response = [
                            'status' => 500,
                            'message' => 'Something Went Wrong. Please Contact Room 301.(Code: EXT)',

                        ];
                        $this->output->set_content_type('application/json')->set_output(json_encode($response));
                        return;
                    }
                } else {
                    $this->errorReport('UIR', 'Error on User Insert at Signup Function', $reg . $phone);
                    $response = [
                        'status' => 500,
                        'message' => 'Something Went Wrong. Please Contact Room 301.(Code: UIR)',

                    ];
                    $this->output->set_content_type('application/json')->set_output(json_encode($response));
                    return;
                }
            }
        } else {
            $this->errorReport('DM', 'Data Missing in Signup Function', $reg . $phone);
            $response = [
                'status' => 500,
                'message' => 'Information Missing or Invalid. Please Recheck.',
            ];
            $this->output->set_content_type('application/json')->set_output(json_encode($response));
            return;
        }


    }

    public function errorReport($code, $details, $user)
    {
        $appDB = $this->load->database('app', TRUE);
        $appDB->query("INSERT INTO `errorReport`(`code`, `details`, `userinfo`) VALUES ('$code', '$details', '$user') ");
    }

    public function getAddress()
    {
        $address = $this->load->database('address', TRUE);
        $districts = $address->query('SELECT * FROM `districts` ORDER BY `name` ASC')->result();
        $divisions = $address->query('SELECT * FROM `divisions` ORDER BY `name` ASC')->result();
        $upazilas = $address->query('SELECT * FROM `upazilas` ORDER BY `name` ASC')->result();
        $unions = $address->query('SELECT * FROM `unions` ORDER BY `name` ASC')->result();

        $response = [
            'status' => 200,
            'districts' => $districts,
            'divisions' => $divisions,
            'upazilas' => $upazilas,
            'unions' => $unions,
        ];
        $this->output->set_content_type('application/json')->set_output(json_encode($response));
        return;
    }

    public function uploadProfilePhoto()
    {
        $this->load->helper('url');
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Handle the uploaded photo
            if (isset($_POST['directory']) && isset($_POST['name'])) {
                $directory = $_POST['directory'];
                $uploadPath = './uploads/AppProfilePhoto/' . $directory . '/';

                // Create the directory if it doesn't exist
                if (!file_exists($uploadPath)) {
                    mkdir($uploadPath, 0777, true);
                }

                $uploadedFile = $_FILES['photo'];
                $fileName = $_POST['name'] . '-' . time() . '.jpg'; // Use the provided name and append '.jpg' extension
                $filePath = $uploadPath . $fileName;

                // Move the uploaded file to the specified directory

                if (move_uploaded_file($_FILES['photo']['tmp_name'], $uploadPath . $fileName)) {
                    $response = array(
                        'status' => 'success',
                        'message' => 'File uploaded successfully.',
                        'file_url' => base_url($filePath)
                    );
                } else {
                    $response = array(
                        'status' => 'error',
                        'message' => 'Failed to upload file.'
                    );
                }
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Invalid request parameters.',
                    'post' => $_POST
                );
            }
        } else {
            $response = array(
                'status' => 'error',
                'message' => 'Invalid request method.'
            );
        }

        // Send the response as JSON
        $this->output->set_content_type('application/json')->set_output(json_encode($response));
    }

    public function getAllNotices()
    {
        $appDB = $this->load->database('app', TRUE);

        $reg = $this->input->get('reg');

        $isLogin = $this->checkLoginStatus($reg);
        if ($reg) {

        if ($isLogin) {

            $get = $appDB->query("SELECT subject_id, hall_id FROM `student_info` WHERE reg_num = '$reg' ");
            $subject_id = $get->row()->subject_id;
            $hall_id = $get->row()->hall_id;

            $type = $appDB->query("SELECT * FROM `noticeType` WHERE status = 1");

            $query = "SELECT notice.*, noticeType.name, noticeType.color, CASE WHEN NVH.noticeId IS NOT NULL THEN true ELSE false END AS isView FROM `notice` JOIN noticeType ON noticeType.id = notice.typeId LEFT JOIN ( SELECT DISTINCT noticeId FROM noticeViewHistory WHERE reg = '$reg' ) AS NVH ON notice.id = NVH.noticeId WHERE (notice.body_id = '$hall_id' OR notice.body_id = '$subject_id') AND notice.status = 1 AND noticeType.status = 1 ORDER BY `notice`.`dateTime` DESC ";

                $ch = $appDB->query($query);

                if ($ch->num_rows() >= 1) {

                    $result = $ch->result();
                    $response = [
                        'status' => 200,
                        'result' => $result,
                        'qurery' => $ch->num_rows(),
                        'type' => $type
                    ];
                    $this->output->set_content_type('application/json')->set_output(json_encode($response));
                    return;
                } else {
                    $response = [
                        'status' => 201,
                        'message' => ' At present, no notices have been published, but this board is primed to display your future updates in due course.'
                    ];
                    $this->output->set_content_type('application/json')->set_output(json_encode($response));
                    return;
                }

            } else {


            $appDB->query("INSERT INTO `unAuthResultCheck` (`exam_id`, `reg_num`, `exam_roll`) VALUES ('0', '$reg', '0')");

            $response = [
                'status' => 501,
                'message' => 'Access Denied. Please Contact Room 301.',
                'data' => $reg
            ];
            $this->output->set_content_type('application/json')->set_output(json_encode($response));
            return;
            }
        } else {
            $response = [
                'status' => 500,
                'message' => 'Data Missing. Please Contact Room 301.',
            ];
            $this->output->set_content_type('application/json')->set_output(json_encode($response));
            return;
        }


    }

    public function getAllCertificateInfo()
    {
        $appDB = $this->load->database('app', TRUE);

        $reg = $this->input->get('reg');

        $isLogin = $this->checkLoginStatus($reg);

        if ($isLogin) {

            if ($reg) {


                $query = "SELECT student_info.exam_id, student_info.reg_num, student_info.exam_roll, exam_info.exam_title, exam_info.result_memo, exam_info.result_publication_status FROM `student_info` JOIN exam_info ON exam_info.exam_id = student_info.exam_id WHERE student_info.reg_num = '$reg' AND student_info.status = 1 AND exam_info.result_publication_status = 'Published' ORDER BY `student_info`.`exam_id`  DESC";

                $ch = $this->db->query($query);

                if ($ch->num_rows() >= 1) {

                    $result = $ch->result();
                    $response = [
                        'status' => 201,
                        'result' => $result,
                        'qurery' => $ch->num_rows(),
                        'message' => 'No Completed Degree Found in our Server.'
                    ];
                    $this->output->set_content_type('application/json')->set_output(json_encode($response));
                    return;
                } else {
                    $response = [
                        'status' => 201,
                        'message' => ' No published results yet. Do not worry, your time to shine will come!'
                    ];
                    $this->output->set_content_type('application/json')->set_output(json_encode($response));
                    return;
                }

            } else {
                $response = [
                    'status' => 500,
                    'message' => 'Data Missing. Please Contact Room 301.',
                ];
                $this->output->set_content_type('application/json')->set_output(json_encode($response));
                return;
            }
        } else {
            $appDB->query("INSERT INTO `unAuthResultCheck` (`exam_id`, `reg_num`, `exam_roll`) VALUES ('0', '$reg', '0')");

            $response = [
                'status' => 501,
                'message' => 'Access Denied. Please Contact Room 301.',
                'data' => $reg
            ];
            $this->output->set_content_type('application/json')->set_output(json_encode($response));
            return;
        }


    }

    public function getMarksheetDetails()
    {
        $appDB = $this->load->database('app', TRUE);

        $reg = $this->input->get('reg');
        $roll = $this->input->get('roll');
        $exam_id = $this->input->get('exam_id');

        $isLogin = $this->checkLoginStatus($reg);

        if ($isLogin) {

            if ($exam_id) {
                $query = "SELECT *  FROM `marksheet_info` WHERE `exam_id` = '$exam_id' ";

                $ch = $this->db->query($query);

                if ($ch->num_rows() >= 1) {

                    $date = date("d-m-Y", strtotime($ch->row()->send_date));
                    $sts = $ch->row()->status;

                    $result = $ch->result();
                    $response = [
                        'status' => 200,
                        'result' => $sts . ' on ' . $date,
                        'message' => $sts == 'Send' ? 'Your marksheet is ready for collection at the department office. Please visit the department at your earliest convenience to collect your marksheet.' : '',
                        'qurery' => $ch->num_rows()
                    ];
                    $this->output->set_content_type('application/json')->set_output(json_encode($response));
                    return;

                } else {

                    $response = [
                        'status' => 201,
                        'message' => 'Your marksheet is currently being prepared with meticulous care. Rest assured, it will soon be on its way to you, bringing a wave of excitement and pride!'
                    ];
                    $this->output->set_content_type('application/json')->set_output(json_encode($response));
                    return;
                }

            } else {
                $response = [
                    'status' => 500,
                    'message' => 'Data Missing. Please Contact Room 301.',
                ];
                $this->output->set_content_type('application/json')->set_output(json_encode($response));
                return;
            }
        } else {
            $appDB->query("INSERT INTO `unAuthResultCheck` (`exam_id`, `reg_num`, `exam_roll`) VALUES ('0', '$reg', '0')");

            $response = [
                'status' => 501,
                'message' => 'Access Denied. Please Contact Room 301.',
                'data' => $reg
            ];
            $this->output->set_content_type('application/json')->set_output(json_encode($response));
            return;
        }


    }

    public function getAllMarksheetInfo()
    {
        $appDB = $this->load->database('app', TRUE);

        $reg = $this->input->get('reg');

        $isLogin = $this->checkLoginStatus($reg);

        if ($isLogin) {

            if ($reg) {
                $query = "SELECT student_info.exam_id, student_info.reg_num, student_info.exam_roll, exam_info.exam_title, exam_info.result_memo, exam_info.result_publication_status FROM `student_info` JOIN exam_info ON exam_info.exam_id = student_info.exam_id WHERE student_info.reg_num = '$reg' AND student_info.status = 1 AND exam_info.result_publication_status = 'Published' ORDER BY `student_info`.`exam_id`  DESC";

                $ch = $this->db->query($query);

                if ($ch->num_rows() >= 1) {

                    $result = $ch->result();
                    $response = [
                        'status' => 200,
                        'result' => $result,
                        'qurery' => $ch->num_rows()
                    ];
                    $this->output->set_content_type('application/json')->set_output(json_encode($response));
                    return;
                } else {
                    $response = [
                        'status' => 201,
                        'message' => ' No published results yet. Do not worry, your time to shine will come!'
                    ];
                    $this->output->set_content_type('application/json')->set_output(json_encode($response));
                    return;
                }

            } else {
                $response = [
                    'status' => 500,
                    'message' => 'Data Missing. Please Contact Room 301.',
                ];
                $this->output->set_content_type('application/json')->set_output(json_encode($response));
                return;
            }
        } else {
            $appDB->query("INSERT INTO `unAuthResultCheck` (`exam_id`, `reg_num`, `exam_roll`) VALUES ('0', '$reg', '0')");

            $response = [
                'status' => 501,
                'message' => 'Access Denied. Please Contact Room 301.',
                'data' => $reg
            ];
            $this->output->set_content_type('application/json')->set_output(json_encode($response));
            return;
        }


    }

    public function getCourseForResult()
    {
        $appDB = $this->load->database('app', TRUE);

        $reg = $this->input->get('reg');
        $roll = $this->input->get('roll');
        $exam_id = $this->input->get('exam_id');

        $isLogin = $this->checkLoginStatus($reg);

        if ($isLogin) {
            if ($reg && $roll && $exam_id) {

                $query = "SELECT course_mark.course_query, course_mark.letter_grade, course_mark.grade_point, course_info.course_code, course_info.query, course_info.course_title, course_info.course_credit FROM course_mark JOIN course_info ON course_info.query = course_mark.course_query WHERE course_mark.reg_num = '$reg' AND course_mark.exam_roll = '$roll' AND course_mark.exam_id = '$exam_id' ";

                $getCourses = $this->db->query($query);

                if ($getCourses->num_rows() >= 1) {
                    $appDB->query("INSERT INTO `resultViewHistory` ( `loginId`, `examId`) VALUES ('$isLogin', '$exam_id')");
                    $response = [
                        'status' => 200,
                        'result' => $getCourses->result()
                    ];
                    $this->output->set_content_type('application/json')->set_output(json_encode($response));
                    return;
                } else {
                    $appDB->query("INSERT INTO `noCourseViewHistory`('loginId','examId') VALUES ('$isLogin', '$exam_id')");
                    $response = [
                        'status' => 201,
                        'q' => $query

                    ];
                    $this->output->set_content_type('application/json')->set_output(json_encode($response));
                    return;
                }
            } else {
                $appDB->query("INSERT INTO `errorHistory` ('loginId','comment', 'data') VALUES ('$isLogin', 'Result NOT Found', 'reg: $reg - Roll: $roll - ExamId: $exam_id')");

                $response = [
                    'status' => 500,
                    'message' => 'Data Missing. Please Contact Room 301.',
                    'data' => $reg . ' - ' . $roll . ' - ' . $exam_id
                ];
                $this->output->set_content_type('application/json')->set_output(json_encode($response));
                return;
            }
        } else {
            $appDB->query("INSERT INTO `unAuthResultCheck` (`exam_id`, `reg_num`, `exam_roll`) VALUES ('$exam_id', '$reg', '$roll')");

            $response = [
                'status' => 501,
                'message' => 'Access Denied. Please Contact Room 301.',
                'data' => $reg . ' - ' . $roll . ' - ' . $exam_id
            ];
            $this->output->set_content_type('application/json')->set_output(json_encode($response));
            return;
        }


        echo 'Request recived';
    }

    public function getAllResult()
    {
        $appDB = $this->load->database('app', TRUE);

        $reg = $this->input->get('reg');

        $isLogin = $this->checkLoginStatus($reg);

        if ($isLogin) {

            if ($reg) {
                $query = "SELECT student_info.*, exam_info.* FROM `student_info` JOIN exam_info ON exam_info.exam_id = student_info.exam_id WHERE student_info.api_reg_num = '$reg' AND student_info.status = 1 ORDER BY `student_info`.`exam_id`  DESC";

                $ch = $this->db->query($query);

                if ($ch->num_rows() >= 1) {

                    $result = $ch->result();
                    $response = [
                        'status' => 200,
                        'result' => $result,
                        'qurery' => $ch->num_rows()
                    ];
                    $this->output->set_content_type('application/json')->set_output(json_encode($response));
                    return;
                } else {
                    $response = [
                        'status' => 201,
                        'message' => ' No published results yet. Do not worry, your time to shine will come!'
                    ];
                    $this->output->set_content_type('application/json')->set_output(json_encode($response));
                    return;
                }

            } else {
                $response = [
                    'status' => 500,
                    'message' => 'Data Missing. Please Contact Room 301.',
                ];
                $this->output->set_content_type('application/json')->set_output(json_encode($response));
                return;
            }
        } else {
            $appDB->query("INSERT INTO `unAuthResultCheck` (`exam_id`, `reg_num`, `exam_roll`) VALUES ('0', '$reg', '0')");

            $response = [
                'status' => 501,
                'message' => 'Access Denied. Please Contact Room 301.',
                'data' => $reg
            ];
            $this->output->set_content_type('application/json')->set_output(json_encode($response));
            return;
        }


    }

    public function getFomFillupData()
    {
        $reg = $this->input->get('reg');


        $otherdb = $this->load->database('db2', TRUE);

        $getSubjectId = $otherdb->query("SELECT SUBJECTS_ID FROM `admitted_student` WHERE ADMITTED_STUDENT_REG_NO = $reg ")->row()->SUBJECTS_ID;

        $id = $otherdb->query("SELECT ADMITTED_STUDENT_ID  FROM `admitted_student` WHERE `ADMITTED_STUDENT_REG_NO` = $reg ")->row()->ADMITTED_STUDENT_ID;

        $exams = $otherdb->query("SELECT * FROM `registered_exam` WHERE SUBJECTS_ID = '$getSubjectId' ")->result();

        $query = "SELECT registered_students.*, registered_exam.* FROM `registered_students` JOIN registered_exam ON registered_exam.REGISTERED_EXAM_ID=registered_students.REGISTERED_EXAM_ID WHERE registered_students.ADMITTED_STUDENT_ID='$id' ORDER BY registered_exam.REGISTERED_EXAM_YEAR DESC";
        $result = $otherdb->query($query)->result();

        $response = [
            'status' => 200,
            'result' => $result,
            'id' => $id,
            'qurery' => $query
        ];
        $this->output->set_content_type('application/json')->set_output(json_encode($response));
        return;
    }

    private function checkLoginStatus($reg)
    {
        $appDB = $this->load->database('app', TRUE);
        $chk = $appDB->query("SELECT id,status FROM `loginSuccessHistory`  WHERE reg = '$reg' AND status = 1 ORDER BY `loginSuccessHistory`.`dateTime`  DESC LIMIT 1 ");
        if ($chk->num_rows() > 0) {
            return $chk->row()->id;
        } else {
            return false;
        }

    }

    public function getFinalData()
    {
        $reg = $this->input->get('reg');

        $finalResult = $this->db->query("SELECT student_info.*, exam_info.exam_semester, exam_info.degree_type  FROM `student_info` JOIN exam_info ON exam_info.exam_id = student_info.exam_id WHERE `api_reg_num` = '$reg' AND `result` LIKE 'promoted' ORDER BY `student_info`.`exam_id`  DESC LIMIT 1");

        $response = [
            'status' => 200,
            'result' => $finalResult
        ];
        $this->output->set_content_type('application/json')->set_output(json_encode($response));
        return;
    }

    // IF YOUR SUBMIT REG == 10 AND PASS > 6 FROM LOGIN PAGE
    public function checkForLogin(){
        $appDB = $this->load->database('app', TRUE);

//        $otherdb = $this->load->database('db2', TRUE);
//        $dairydb = $this->load->database('dairy', TRUE);
//        $addressdb = $this->load->database('address', TRUE);

        $reg = $this->input->get('reg');
        $pass = $this->input->get('pass');
        $netInfo = $this->input->get('netInfo');
        $deviceName = $this->input->get('deviceName');
        $osVersion = $this->input->get('osVersion');
        $lang = $this->input->get('lang');
        $statusBarHeight = $this->input->get('statusBarHeight');
        $sessionId = $this->input->get('sessionId');
        $ipAddress = $this->input->get('ipAddress');
        $device = $this->input->get('device');
        $version = $this->input->get('version');


        if ($reg && $pass) {
            $numberAsString = strval($reg);
            $length = strlen($numberAsString);

            if ($length == 10) {

                // CHECKING IN APP DB
                $appDBCheck = $appDB->query("SELECT * FROM users WHERE reg_num = '$reg' AND password = '$pass' ");

                if ($appDBCheck->num_rows() == 1) {

                    $userID = $appDBCheck->row()->id;
                    $isBlocked = $appDBCheck->row()->status;

                    if (!$isBlocked) {

                        $appDB->query("INSERT INTO `blockedLoginTry`(`userId`,`reg`, `pass`, `appVersion`, `netInfo`, `device`, `deviceName`, `osVersion`, `lang`, `statusBarHeight`, `sessionId`, `ipAddress`, `comment`) VALUES ('$userID','$reg','$pass','$version','$netInfo','$device','$deviceName','$osVersion', '$lang','$statusBarHeight','$sessionId','$ipAddress','Status 0 in user table') ");

                        $response = [
                            'status' => 303,
                            'message' => 'Access Blocked.',
                        ];
                        $this->output->set_content_type('application/json')->set_output(json_encode($response));
                        return;
                    } else {
                        $checkInfo = $appDB->query("SELECT * FROM student_info WHERE userId = '$userID' AND reg_num = '$reg'AND status = 1 ");

                        if ($checkInfo->num_rows() >= 1) {

                            $appDB->query("INSERT INTO `loginSuccessHistory`(`reg`, `pass`, `appVersion`, `netInfo`, `device`,  `deviceName`,`osVersion`, `lang`, `statusBarHeight`, `sessionId`, `ipAddress`,`comment`) VALUES ('$reg','$pass','$version','$netInfo', '$device', '$deviceName','$osVersion', '$lang','$statusBarHeight','$sessionId','$ipAddress','Student Found on Server') ");

                            $token = $appDB->insert_id();

                            $response = [
                                'status' => 200,
                                'token' => $token,
                                'name' => $checkInfo->row()->name_en,
                                'hall' => $checkInfo->row()->hall_name,
                                'dept' => $checkInfo->row()->dept_name,
                                'photo' => $checkInfo->row()->chobi,
                            ];
                            $this->output->set_content_type('application/json')->set_output(json_encode($response));
                            return;
                        } else {
                            $response = [
                                'status' => 201,
                                'message' => 'User FOUND but Student NOT Found on App Server : ',
                                'data' => $checkInfo->result(),
                            ];
                            $this->output->set_content_type('application/json')->set_output(json_encode($response));
                            return;
                        }
                    }

                } else {

                    $appDB->query("INSERT INTO `invalidLoginTry`(`reg`, `pass`,  `appVersion`,`netInfo`, `device`, `deviceName`, `osVersion`, `lang`, `statusBarHeight`, `sessionId`, `ipAddress`, `comment`) VALUES ('$reg','$pass','$version','$netInfo','$device','$deviceName','$osVersion', '$lang','$statusBarHeight','$sessionId','$ipAddress','NOT FOUND IN user TABLE') ");

                    $api = $appDB->query("SELECT `value` FROM `settings` WHERE `keys` = 'InfoApi' AND status = 1 ")
                        ->row()->value;
                    $response = [
                        'status' => 300,
                        'message' => 'User NOT Found on App Server : ',
                        'api' => $api
                    ];
                    $this->output->set_content_type('application/json')->set_output(json_encode($response));
                    return;
                }

            } else {
                $appDB->query("INSERT INTO `invalidLoginTry`(`reg`, `pass`, `appVersion`, `netInfo`, `device`, `deviceName`, `osVersion`, `lang`, `statusBarHeight`, `sessionId`, `ipAddress`, `comment`) VALUES ('$reg','$pass','$version','$netInfo','$device','$deviceName','$osVersion', '$lang','$statusBarHeight','$sessionId','$ipAddress','reg length is invalid.') ");
            }
        } else {
            $appDB->query("INSERT INTO `invalidLoginTry`(`reg`, `pass`, `appVersion`, `netInfo`, `device`, `deviceName`, `osVersion`, `lang`, `statusBarHeight`, `sessionId`, `ipAddress`, `comment`) VALUES ('$reg','$pass','$version','$netInfo','$device','$deviceName','$osVersion', '$lang','$statusBarHeight','$sessionId','$ipAddress','reg or pass is empty') ");
        }

    }
}

 
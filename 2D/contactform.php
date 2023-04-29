<?php
require __DIR__.'/assets/php/phpmailer/Exception.php';
require __DIR__.'/assets/php/phpmailer/PHPMailer.php';
require __DIR__.'/assets/php/phpmailer/SMTP.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sanitize($input) {
    $input = strip_tags($input);
    $input = htmlspecialchars($input);
    $input = addslashes($input);
    return $input;
}

function validateRecaptcha($token) {
    $secret_key = '_omitted_for_security_';
    $url = 'https://www.google.com/recaptcha/api/siteverify?secret='.$secret_key.'&response='.$token;
    $response = file_get_contents($url);
    $response = json_decode($response);
    if($response->success) {
        return true;
    } else {
        $ec = 'error-codes';
        return $response->$ec;
    }
}

if(isset($_POST['msgFrom']) && isset($_POST['msgReplyTo']) && isset($_POST['msgBody']) && isset($_POST['rct'])) {
    $msgFrom = sanitize($_POST['msgFrom']);
    $msgReplyTo = sanitize($_POST['msgReplyTo']);
    $msgBody = sanitize($_POST['msgBody']);
    $rct = sanitize($_POST['rct']);
    $validToken = validateRecaptcha($rct);
    if($validToken === true) {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->SMTPAuth = true;
            $mail->Host = '_omitted_for_security_';
            $mail->Username = '_omitted_for_security_';                     
            $mail->Password = '_omitted_for_security_';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port = 465;
            $mail->setFrom('contactform@knoxy.tk', $msgFrom);
            $mail->addAddress('tyler@knoxy.tk', 'Tyler Knox');
            $mail->addReplyTo($msgReplyTo, $msgFrom);
            $mail->Subject = 'Knoxy.tk Contact Form Submission';
            $mail->Body = $msgBody;
            $mail->send();
            echo json_encode(array('response'=>'success', 'message'=>'Your message was sent successfully. Thank you!'));
        } catch (Exception $e) {
            echo json_encode(array('response'=>'error', 'message'=>$mail->ErrorInfo));
        }
    } else {
        echo json_encode(array('response'=>'error', 'message'=>$validToken));
    }
} else {
    echo json_encode(array('response'=>'error', 'message'=>'Missing information. Please fill out the entire form!'));
}
?>
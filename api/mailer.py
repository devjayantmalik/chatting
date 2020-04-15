import os
import smtplib

MAIL_SENDER_NAME = os.getenv('MAIL_SENDER_NAME')
MAIL_SENDER_EMAIL = os.getenv('MAIL_SENDER_EMAIL')

MAIL_SERVER_HOST = os.getenv('MAIL_SERVER_HOST')
MAIL_SERVER_PORT = os.getenv('MAIL_SERVER_PORT')

MAIL_SERVER_USERNAME = os.getenv('MAIL_SERVER_USERNAME')
MAIL_SERVER_PASSWORD = os.getenv('MAIL_SERVER_PASSWORD')

def get_message(receiver_email, token):
    message = f"""From: {MAIL_SENDER_NAME} {MAIL_SENDER_EMAIL} \r\nTo: {receiver_email} \r\nMIME-Version: 1.0 \r\nContent-type: text/html \r\nSubject: Account Verification Email \r\n

    <h1>Account Confirmation Flack</h1>
    <p>Dear user, you need to activate your account, before using flack chatting app. Below is the link provided. Click on the link to activate your account.</p>
    <a target="_blank" href="https://flack-chatting.herokuapp.com/auth/verify/{token}">Click to activate</a>

    <br />
    <p> Or you can copy and paste the code in your browser to activate the account.</p>
    <strong>https://flack-chatting.herokuapp.com/auth/verify/{token}</strong>

    <h2>Thanks for your support.</h2>
    <p>We are always standing with you, to help you out. If you want any help, just reply to this email or mail us at: <strong>prod.jayantmalik@gmail.com<strong></p>

    <p>With Regards, <br />Jayant Malik,<br /> Developer of Flack Application.</p>
    """

    return message

def send_mail(to, token):
    # Get message to send
    message = get_message(to, token)

    try:
        # Create email
       mail = smtplib.SMTP_SSL(MAIL_SERVER_HOST, MAIL_SERVER_PORT)

       # Login to mail server
       res = mail.login(MAIL_SERVER_USERNAME, MAIL_SERVER_PASSWORD)

       # send the email
       mail.sendmail(MAIL_SENDER_EMAIL, to, message)

       # Close the server connection
       mail.close()
       return True
       
    except Exception as ex:
        print(ex)
        return False

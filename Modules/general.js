exports.NOW = function () {
    nDate = new Date().toLocaleString('en-US', {
        timeZone: "America/New_York"
    });
    return nDate;
}


exports.parseDate = function (date) {
    newDate = new Date(date);

    month = newDate.getMonth() + 1;
    month = (month <= 9) ? "0" + month : month;

    date = newDate.getDate();
    date = (date <= 9) ? "0" + date : date;

    return newDate.getFullYear() + '-' + month + '-' + date;
}


exports.MiliSecondtoLocalTime = function (a) {
    dateTime = new Date(a);
    return dateTime.toLocaleString('en-US', {
        timeZone: 'UTC'
    });
}

exports.MiliSecondtoTime = function (millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

exports.removeSpaces = function (str) {
    return str.replace(/\s+/g, ' ');
}

exports.SendEmail = async function (Sender, Email, Subject, Emailtext) {
    let transporter = nodemailer.createTransport({
        host: Sender.emaildetail.host,
        port: Sender.emaildetail.port,
        secure: false, // true for 465, false for other ports
        auth: {
            user: Sender.emaildetail.key,
            pass: Sender.emaildetail.password
        },
    });
    try {
        let info = await transporter.sendMail({
            from: Sender.Title + ' <' + Sender.emaildetail.sendfrom + '>', // sender address
            to: Email,
            subject: Subject,
            html: Emailtext,
        });
    } catch (e) {
        console.log("Email Not Sent!!!");
        console.log("Error:" + e);
    }
    //console.log(info);
}
var currentStatus = {
    currentDuty: false,
    currentd: false,
    currentJob: null,
    currentGrade: null,
    source: null
};

var localdata = {
    mydata: currentStatus,
    officerstable: null,
    CurrentActiveMenu: null,
    CurrentActiveNav: null,
    ToggleResize: false,
    ToggleMove: false,
    Focused: false,
    OpenKey: 0,
    policecount: 0,
    messagesidx: 0,
};





var listComponentConfig = {
    el: ".all-contents",
};

const ListApp = new Vue(listComponentConfig);

function TextAbstract(text, maxLength) {
    if (text == null) {
        return "";
    }
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + "...";
}


$(document).ready(function () {
    $(".container, .notify-badge").hide();
    $("#toggle-duty").prop("checked", localdata.mydata.currentDuty);
    $("#toggle-d").prop("checked", localdata.mydata.currentd);
    $("div.content").each(function () {
        $(this).hide();
    });


    function navigateSection(newSectionId, newNavId) {
        if (localdata.CurrentActiveMenu !== newSectionId) {
            $("#" + localdata.CurrentActiveMenu).addClass("animate__animated animate__fadeOut");
            setTimeout(() => {
                $("#" + localdata.CurrentActiveMenu).hide().removeClass("animate__animated animate__fadeIn animate__fadeOut");
                $("#" + localdata.CurrentActiveNav).removeClass("activebutton");
                $("#" + newSectionId).show().addClass("animate__animated animate__fadeIn");
                localdata.CurrentActiveNav = newNavId;
                localdata.CurrentActiveMenu = newSectionId;
            }, 500);
        }

        $("#" + newNavId).addClass("activebutton");
    }

    localdata.CurrentActiveMenu = "police-container";
    localdata.CurrentActiveNav = "police-list";
    $("#police-list").addClass("activebutton");
    $("#police-container").show();


    function toggleContainerFeatures(featureId, isEnabled) {
        if (featureId === 1) { // Assuming 1 represents the resize feature
            $(".container").resizable({ disabled: !isEnabled });
            localdata.ToggleResize = !localdata.ToggleResize;
        } else if (featureId === 2) { // Assuming 2 represents the drag feature
            $(".container").draggable({ disabled: !isEnabled });
            localdata.ToggleMove = !localdata.ToggleMove;
        }
    }

    function LoadUi(officers, currentDuty, currentd, currentJob, currentGrade, minGradeForAction, source) {
        // Clear existing content in containers
        $("#police-container, .section-content").empty();
        // Update global data object with new values
        localdata.mydata = { currentDuty, currentd, currentJob, currentGrade, source };

        // Disable or enable message input and confirmation based on grade
        if (minGradeForAction > currentGrade) {
            $(".message-input, .message-confirm").addClass("disabled2");
        } else {
            $(".message-input, .message-confirm").removeClass("disabled2");
        }

        $("#toggle-duty").prop("checked", currentDuty);
        
        $("#toggle-d").prop("checked", currentd);
        let RequiredOfficers = 11
        localdata.officerstable = officers;

        $("#police-count").html(officers.length);

        // Iterate over officers data to update the UI
        officers.forEach(officer => {
            if (officer.onduty) {
                DutyStyle = `
                background-image: linear-gradient(250deg ,rgba(42, 144, 42,0.280), rgba(4, 4, 4,0.0)) !important;
                height: 30px !important;
                `
            } else {
                DutyStyle = `
                background-image: linear-gradient(250deg, rgba(244, 42, 42, 0.280), rgba(4, 4, 4, 0.0)) !important;
                height: 30px !important;
                `
            }
            RequiredOfficers -= officers.length
            // const talkingIcon = officer.talking ?
            //     "<i class=\"fa-duotone fa-microphone fa-shake\"></i>" :
            //     "<i class=\"fa-duotone fa-microphone\"></i>";
                                // <div class="talking" data-source="${officer.id}">${talkingIcon}</div>

            const officerHtml = `
            <div class="officer" data-source="${officer.id}" data-radio="${officer.radio}">
                <div class="callsign">${officer.callsign}</div>
                <div class="name">${TextAbstract(officer.name, 13)}</div>
                <div class="actions" style="${DutyStyle}">
                    <div class="radio">${officer.radio}</div>
                    <div class="location" data-source="${officer.id}"><i class="fa-solid fa-location-dot"></i></div>
                </div>
            </div>`;


            $("#police-container").append(officerHtml);
            $('.listofficersecondcontainer').remove()
            if (RequiredOfficers > 0) {
              for (let i = 1; i <= RequiredOfficers; i++) {
                var elem = '<div class="listofficersecondcontainer"></div>'
                $('#police-container').append(elem)
              }
            }
        });


    }

    $(document).on("keydown", function (event) {
        if (event.keyCode === localdata.OpenKey) {
            $.post("https://" + GetParentResourceName() + "/ToggleFoucs");
        }
    });

    $(".messages").on("click", ".message .message-date-time #delete-message", function () {
        const messageId = $(this).closest('.message').attr("id");
        $("#" + messageId).remove();
    });

    $("#toggle-resize").click(function () {
        sounds1.audio2();
        toggleContainerFeatures(1, !localdata.ToggleResize);
    });

    $("#toggle-move").click(function () {
        sounds1.audio2();
        toggleContainerFeatures(2, !localdata.ToggleMove);
    });

    $("#toggle-duty").click(function () {
        sounds1.audio2();
        $.post("https://" + GetParentResourceName() + "/toggleduty");
    });


    $("#toggle-d").click(function () {
        sounds1.audio2();
        $.post("https://" + GetParentResourceName() + "/toggled");
    });


    $(".message-confirm").click(function () {
        const messageInput = $(".message-input").val();
        if (messageInput !== "") {
            $.post("https://" + GetParentResourceName() + "/sendmessage", JSON.stringify({
                message: messageInput,
                type: localdata.mydata.currentJob
            }));
            $(".message-input").val("");
        }
    });

    $(".callsign-confirm").click(function () {
        const callsignInput = $(".callsign-input").val();
        if (callsignInput !== "") {
            $.post("https://" + GetParentResourceName() + "/changecallsign", JSON.stringify({
                callsign: callsignInput
            }));
            $(".callsign-input").val("");
        }
    });

    $("#police-container").on("click", ".officer .actions .location", function () {
        const source = $(this).attr("data-source");
        $.post("https://" + GetParentResourceName() + "/getlocation", JSON.stringify({ source: source }));
    });


    $("#police-container").on("click", ".officer .actions .talking", function () {
        const source = $(this).attr("data-source");
        $.post("https://" + GetParentResourceName() + "/joinchannel", JSON.stringify({ source: source }));
    });

    $("#police-list, #settings").click(function () {
        const dataToShow = $(this).attr("data-show");
        const navId = $(this).attr("id");
        navigateSection(dataToShow, navId); // Assuming navigateSection is the actual function name for `_0x163c5c`
    });

    $("#chat").click(function () {
        $("#chat-icon").removeClass("fa-fade");
        $(".notify-badge").fadeOut(100);
        navigateSection($(this).attr("data-show"), "chat"); // Assuming navigateSection is the actual function for `_0x163c5c`
    });

    $('#exitvendors').click(function () {
        CloseUI()
    });

    $("#close-hub").click(function () {
        $.post("https://" + GetParentResourceName() + "/closehub");
    });

    CloseUI = function () {
        $('.container').fadeOut(120)
        $.post(`https://` + GetParentResourceName() + '/close', JSON.stringify({}));
        $.post("https://" + GetParentResourceName() + "/closehub");
    };

    $(document).on('keydown', function () {
        switch (event.keyCode) {
            case 27: // control
                $.post(`https://${GetParentResourceName()}/ToggleFoucs`, JSON.stringify({}));
                break;
        }
    });

    window.addEventListener("message", function (event) {
        const data = event.data;

        switch (data.action) {
            case "Uiopen":
                if (data.boolean) {
                    $(".container").fadeIn();
                } else {
                    $(".container").fadeOut();
                }
                break;
            case "LoadUi":
                LoadUi(data.officers, data.myData.Duty, data.myData.d,data.myData.Job, data.myData.Grade, data.cantype, data.myData.Source);
                break;
            case "sendmessage":
                const notifySound = document.getElementById("notifysound");
                notifySound.currentTime = 0.8;
                notifySound.volume = 0.262;
                notifySound.play();
                localdata.messagesidx++;
                let messageHtml = `
                    <div class="message" id="message-${localdata.messagesidx}">
                        <div class="message-text">${data.message}</div>
                        <div class="message-date-time">${localdata.mydata.currentGrade >= data.deletegrade ? ' <div id="delete-message"><i class="fa-duotone fa-trash-xmark" style="--fa-primary-opacity: 0.4; --fa-secondary-opacity: 1;"></i></div>' : ''}</div>
                        <div class="message-sep"></div>
                    </div>
                `;
                $(".messages").prepend(messageHtml);

                if (localdata.CurrentActiveNav !== "chat") {
                    $("#chat-icon").addClass("fa-fade");
                    $(".notify-badge").fadeIn(100);
                }
                break;
        }
    });

});

sounds1 = {}
sounds1.audio2 = function () {
  var audio2s = document.getElementById("new1");
  audio2s.volume = 1.0;
  audio2s.play();
}
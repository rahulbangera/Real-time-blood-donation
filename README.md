
# Real Time Blood Donation Website (APP TOOO Kinda 😉)

This website is designed to seamlessly connect Blood Donors and Requestors. 

It allows users to register through Email OTP based signup and then depending on the user, he/she might opt for being a donor and this process has been made successful by making use of Google Maps API, where user will be presented with an interactive map where he/she can mark the hospitals that they are willing to donate in. 

When a user wants to request blood, he/she can click on request blood, select his location with the radius he/she wants the donors to be in. And then hitting on search donors, they will be provided with the list of hospitals and also the donors count available in each hospital. As per wish, they can click on send request to each hospital.

By clicking on Send Request, in the backend, all the donors who have opted for that hospital will be notified by email, web push notifications, app push notifications (if installed)

Then the donor might come to their dashboard and if he/she wants to donate blood to the requestor, they can click on accept or else decline if needed. If accepted, that request will be deleted from other donor dashboards. Now the donor who has accepted the request, they can contact the donor by clicking on Contact button and the moile number will be visible. Also he/she has an option to do live chat with the donor if necessary.

Also, as above mentioned, we are maintaining donor and requestor privacy by not showing his/her phone number until they accept the request...

But what if there is an Emergency situation, where they don't really have time to register and login.. And also if they want to Broadcast their phone number to all the nearby donors as it is an Emergency..
Don't worry we have your back there too, we have a latest feature called SOS request where people can click on it and just fill basic details, select the location or the hospital they need blood urgently. And BOOM! Within 10 KM radius all the donors will be notified with the MOBILE NUMBER of the requestor as its an Emergency. And in the dashboard, we have a dedicated card for this as SOS requests.

# INTERESTING PART 🎉

Ok, now coming to the interesting part, we thought nowadays people tend to use Apps more than Website and also we know people do ignore Web notifications..
So for that reason, we also have our nice responsive ANDROID APP which is made using Android Studio and the tool called WebView and for the notifications we are using Firebase App notifications API
It was not so easy as we didn't have any sort of expertise in that field, but yeah we did it

You can find the APP download link in the releases section


## Tech Stack

**FrontEnd:** HTML, CSS, Vanilla JS

**Backend:** Node, Express

**Database** MongoDB (NoSQL)

**Templating Engine** EJS

**Others** Firebase, NodeMailer


## Features

- Donate Blood
- Request Blood
- SOS Blood Request (No SignIn Required)
- Live Chat Between Donor and Requestor
- Notifications through Email, Website, App (YES you heard it ryt.. Scroll Up to know more)
- Mobile Responsive 
- **Notification through Whatsapp has been implemented but doesn't work due to paid service restrictions**

## Run Locally

Clone the project

```bash
  git clone https://github.com/Bnir/Real-time-blood-donation
```

Go to the project directory

```bash
  cd Real-time-blood-donation
```

Install dependencies

```bash
  npm i
```

Start the server

```bash
  npm start
```



# Real Time Blood Donation Website (APP TOOO Kinda 😉) 

- Our platform is designed to effortlessly connect **Blood Donors** and **Requestors**, ensuring life-saving support is always just a few clicks away. With a simple **Email OTP-based signup**, users can register and choose their role—donor or requestor. Donors can leverage an **interactive map powered by Google Maps API** to mark hospitals where they are willing to donate, making the process location-specific and efficient.  

- For those in need, requesting blood is just as easy. By selecting a location radius, requestors can search for nearby donors and receive a list of hospitals along with the donor count at each location. Requests can then be sent directly to the hospital of their choice. Behind the scenes, all donors linked to the selected hospital are instantly notified via **Email**, **Web Push Notifications**, and **App Push Notifications**, ensuring timely responses.  

- Donors can manage requests through their **personal dashboard**, where they have the option to **accept** or **decline** requests. Accepted requests are automatically removed from other dashboards to prevent duplication. Once a donor accepts, they can view the requestor’s phone number or start a **live chat** for further coordination—all while ensuring **privacy** by keeping phone numbers hidden until a request is accepted.  

- In emergencies, where there’s no time to register, our **SOS Request** feature comes to the rescue. Users can fill out basic details, select their location or hospital, and instantly **broadcast their phone number** to all donors within a **10 KM radius**. These urgent requests are prominently displayed on donor dashboards as **SOS cards**, ensuring maximum visibility and priority.  

- Whether it’s a planned donation or a critical emergency, our platform is your one-stop solution to saving lives.

# FROM WEB TO APP: WE’VE GOT YOU COVERED! 🚀

In today’s world, apps dominate over websites, and let’s be real – web notifications often get ignored. That’s why we’ve leveled up with a sleek, **responsive Android App** built using **Android Studio** and **WebView**.  

For notifications, we’ve integrated the **Firebase App Notifications API** to ensure you never miss an update.  

It wasn’t easy, given our limited expertise in this area, but hey – **we made it happen!**  

Find the download link for the app in the **Releases** section.


## Tech Stack

**FrontEnd:** HTML, CSS, Vanilla JS

**Backend:** Node, Express

**Database** MongoDB (NoSQL)

**Templating Engine** EJS

**Others** Firebase, NodeMailer


## Features

- Donate Blood Effortlessly:  Transform lives with a seamless and intuitive platform.
- Request Blood Instantly:  Connect with donors in moments when every second counts.
- SOS Blood Request (No Sign-In Required):  Access immediate assistance in emergency without delays or barriers.
- Real-Time Live Chat:  Facilitate smooth, direct communication between donors and requestors.
- Comprehensive Notifications:  Stay updated through Email, Website, and App alerts.
- Fully Mobile-Responsive:  Experience unmatched accessibility on any device.
- WhatsApp Notifications Integrated:  Functional yet limited by premium service restrictions.

## Run Locally

## ⚡ Credential Setup Required for Full Functionality ⚡
- To ensure all features operate seamlessly, you'll need to input your credentials.
- A blank .env.example file has been provided—simply fill in the required details and rename it to .env for proper configuration.
- Ensure you’ve completed this step for optimal performance and access to all features.

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


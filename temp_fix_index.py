#!/usr/bin/env python3
import re

file_path = r'E:\mba\app\templates\index.html'

# Read the file
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the noticesvisionmission section and replace it with a clean two-column layout
pattern = r'<div class="noticesvisionmission">.*?<link rel="stylesheet" href="{{ url_for\(\'static\', filename=\'css/vision-mission\.css\'\) }}">'

replacement = '''<div class="noticesvisionmission">
  <div class="notices">
    <div class="notice-board">
      <div class="notice-title"> Latest Notices</div>
      <div class="date-time" id="dateTime"></div>
      <div id="generalNoticesContainer" class="notices-wrapper active-tab">
        <div class="notices-content" id="generalNoticeContent">
         
        </div>
        <button id="loadMoreGeneralButton" class="load-more-btn" style="display:none;">Load More</button>
      </div>
    </div>
  </div>

  <div class="message-carousel">
    <div class="message-slides">
      <div class="message-slide active">
        <div class="message-image">
          <img src="{{ url_for('static', filename='babuji.jpeg') }}" alt="Prof. Dr. Ram Ujagar Tiwari">
        </div>
        <div class="message-content">
          <h3>Late - Dr.Ram Ujagar Tiwari</h3>
          <h4>Founder Chairman</h4>
          <div class="message-text">
            <p>My Dear Friends,</p>
            <p>I have great pleasure and sincere gratitude towards GOD, who made me instrumental to establish this great Institution. I feel that SERVICE THROUGH EDUCATION IS SERVICE TO HUMANITY AND THIS SERVICE TO MANKIND IS SERVICE TO GOD. Our passion is to excel in 'QUALITY EDUCATION'. Quality never comes by accident. It is always the result of High Intention, Sincere effort towards right direction and skillful Execution.</p>
            <p>Our Programme is "Move To Grow" – focus on students' 'Personality Development', who are responsible leaders of tomorrow.</p>
          </div>
        </div>
      </div>
      <div class="message-slide">
        <div class="message-image">
          <img src="{{ url_for('static', filename='Pramod.R.t.jpeg') }}" alt="Dr. Pramod R. Tiwari">
        </div>
        <div class="message-content">
          <h3>Late - Pramod R. Tiwari</h3>
          <h4>Founder Hon. Secretary</h4>
          <div class="message-text">
            <p>"Let us be the wings of others' dreams" Welcome to Saket Gyanpeeth established in 1994 with our motto "Gyanam Anantam". A "vibrant innovative temple of service". The main purpose of this trust is to render untiring selfless service to the society through value based education.</p>
            <p>चाहे थक जाये पर राह नहीं थकती, चाहे थक जाये पर चाह नहीं थकती। हुये आज इनके कितने साल पर सेवा से इनकी चाह नहीं थकती।।</p>
          </div>
        </div>
      </div>
    </div>
    <div class="message-nav-controls"></div>
    <div class="message-controls">
      <span class="message-indicator active"></span>
      <span class="message-indicator"></span>
    </div>
  </div>
</div>

<link rel="stylesheet" href="{{ url_for('static', filename='css/vision-mission.css') }}">'''

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Write the file
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✓ Fixed! Layout now has notices on left and message carousel on right, side by side.")

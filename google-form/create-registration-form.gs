/**
 * Greenwave Trivia & Games Night: registration Google Form builder.
 *
 * HOW TO USE
 * 1. Go to https://script.google.com and click "New project".
 * 2. Delete the sample code, paste this whole file in, and click Save.
 * 3. Choose createGreenwaveRegistrationForm in the function menu and click Run.
 * 4. Approve the permissions Google asks for (it needs to create a Form and a Sheet in your Drive).
 * 5. Open "Execution log" at the bottom. It prints the links: one general link, a volunteer link,
 *    a vendor link, the edit link and the responses spreadsheet.
 *
 * Every response lands in one Google Sheet, with a column showing whether the person
 * registered as an Attendee, a Volunteer or a Vendor, so you can filter each group.
 */

// Edit these before running if the details change.
var EVENT_NAME = 'Greenwave Trivia & Games Night';
var EVENT_DATE = 'Wednesday, 18 November 2026';
var CONTACT = '+254 700 519 130';

function createGreenwaveRegistrationForm() {
  var form = FormApp.create(EVENT_NAME + ': Registration');
  form.setTitle(EVENT_NAME + ': Registration')
    .setDescription(
      'Join Greenwave Society for an evening of trivia, games and community on ' + EVENT_DATE + '.\n\n' +
      'Use this form to register as an attendee, a volunteer or a vendor. ' +
      'Venue and time details will be shared with everyone who registers.\n\n' +
      'Questions? Call or WhatsApp ' + CONTACT + '.'
    )
    .setConfirmationMessage(
      'Thank you for registering with Greenwave Society! We have received your details and ' +
      'will contact you before ' + EVENT_DATE + ' with the venue, time and next steps. ' +
      'Questions? Call or WhatsApp ' + CONTACT + '.'
    )
    .setProgressBar(true)
    .setShowLinkToRespondAgain(false)
    .setAcceptingResponses(true);

  var emailCheck = FormApp.createTextValidation()
    .setHelpText('Please enter a valid email address.')
    .requireTextIsEmail()
    .build();
  var phoneCheck = FormApp.createTextValidation()
    .setHelpText('Please enter a valid phone number, for example 0712 345 678 or +254 712 345 678.')
    .requireTextMatchesPattern('^\\+?[0-9 ]{9,16}$')
    .build();

  // SECTION 1: details everyone gives
  form.addSectionHeaderItem().setTitle('Your details');
  form.addTextItem().setTitle('Full name').setRequired(true);
  form.addTextItem().setTitle('Email address').setValidation(emailCheck).setRequired(true);
  form.addTextItem().setTitle('Phone number (WhatsApp preferred)').setValidation(phoneCheck).setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Gender')
    .setChoiceValues(['Female', 'Male', 'Prefer not to say'])
    .setRequired(false);
  form.addMultipleChoiceItem()
    .setTitle('Age group')
    .setChoiceValues(['Under 18', '18 to 24', '25 to 34', '35 to 44', '45 and above'])
    .setRequired(true);
  form.addTextItem()
    .setTitle('Institution, organisation or workplace')
    .setHelpText('Optional')
    .setRequired(false);
  form.addMultipleChoiceItem()
    .setTitle('How did you hear about this event?')
    .setChoiceValues(['Instagram', 'TikTok', 'X (Twitter)', 'WhatsApp', 'Facebook', 'LinkedIn', 'A friend or colleague', 'Greenwave member'])
    .showOtherOption(true)
    .setRequired(true);
  form.addCheckboxItem()
    .setTitle('Consent')
    .setChoiceValues([
      'I agree that Greenwave Society may contact me about this event.',
      'I understand that photos and videos may be taken at the event and shared on Greenwave platforms.'
    ])
    .setValidation(FormApp.createCheckboxValidation()
      .setHelpText('Please tick both boxes to continue.')
      .requireSelectExactly(2)
      .build())
    .setRequired(true);

  var role = form.addMultipleChoiceItem()
    .setTitle('I am registering as')
    .setHelpText('Pick one. The next page will ask a few questions for that group.')
    .setRequired(true);

  // SECTION 2: attendees
  var attendeePage = form.addPageBreakItem()
    .setTitle('Attendee details')
    .setHelpText('A few quick questions so we can plan the games and teams.');
  form.addMultipleChoiceItem()
    .setTitle('Are you coming alone or with a group?')
    .setChoiceValues(['Alone', 'With friends (2 to 4 people)', 'With a team (5 or more people)'])
    .setRequired(true);
  form.addTextItem()
    .setTitle('If you are coming with others, how many people (including you)?')
    .setValidation(FormApp.createTextValidation()
      .setHelpText('Please enter a number.')
      .requireWholeNumber()
      .build())
    .setRequired(false);
  form.addTextItem()
    .setTitle('Trivia team name (if you have one)')
    .setRequired(false);
  form.addCheckboxItem()
    .setTitle('Which activities are you most excited about?')
    .setChoiceValues(['Trivia quiz', 'Board games', 'Card games', 'Group games', 'Just networking and hanging out'])
    .showOtherOption(true)
    .setRequired(false);
  form.addTextItem()
    .setTitle('M-Pesa transaction code (if you have already paid)')
    .setHelpText('Optional. Leave blank if you will pay later or at the door.')
    .setRequired(false);
  form.addParagraphTextItem()
    .setTitle('Any accessibility needs, dietary needs or questions for us?')
    .setRequired(false);

  // SECTION 3: volunteers
  var volunteerPage = form.addPageBreakItem()
    .setTitle('Volunteer details')
    .setHelpText('Thank you for offering your time! Tell us how you would like to help.')
    .setGoToPage(FormApp.PageNavigationType.SUBMIT); // attendees finish here
  form.addCheckboxItem()
    .setTitle('Which roles would you like to take on?')
    .setChoiceValues([
      'Registration and check in desk',
      'Ushering and guest welcome',
      'Venue setup and teardown',
      'Trivia host or games facilitator',
      'Scorekeeping',
      'Photography and videography',
      'Social media coverage',
      'Refreshments'
    ])
    .showOtherOption(true)
    .setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Have you volunteered with Greenwave Society before?')
    .setChoiceValues(['Yes', 'No'])
    .setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Can you arrive early to help with setup?')
    .setChoiceValues(['Yes', 'No', 'Maybe'])
    .setRequired(true);
  form.addCheckboxItem()
    .setTitle('Would you also like to volunteer at our other upcoming events?')
    .setChoiceValues([
      'Charity Walk (Sunday 22 November)',
      'Young Entrepreneurs Networking Brunch (Sunday 29 November)',
      'Skills for Change Workshop (Saturday 5 December)',
      'Sports Tournament (Saturday 12 December)',
      'Community Picnic (Saturday 19 December)',
      'Not at the moment'
    ])
    .setRequired(false);
  form.addParagraphTextItem()
    .setTitle('Relevant skills or experience')
    .setHelpText('Optional. For example event management, photography, MC work or first aid.')
    .setRequired(false);
  form.addTextItem()
    .setTitle('Emergency contact (name and phone number)')
    .setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('T-shirt size (for volunteer branding)')
    .setChoiceValues(['S', 'M', 'L', 'XL', 'XXL'])
    .setRequired(false);

  // SECTION 4: vendors
  var vendorPage = form.addPageBreakItem()
    .setTitle('Vendor details')
    .setHelpText('Tell us about your business. Booth fees and setup instructions will be shared when we confirm your slot.')
    .setGoToPage(FormApp.PageNavigationType.SUBMIT); // volunteers finish here
  form.addTextItem().setTitle('Business or brand name').setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Business category')
    .setChoiceValues(['Food and snacks', 'Drinks', 'Fashion and accessories', 'Arts and crafts', 'Books and stationery', 'Beauty and wellness', 'Eco friendly products', 'Services'])
    .showOtherOption(true)
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('What will you be selling or showcasing?')
    .setRequired(true);
  form.addTextItem()
    .setTitle('Instagram, TikTok or website link')
    .setHelpText('Optional')
    .setRequired(false);
  form.addMultipleChoiceItem()
    .setTitle('Do you need a power connection at your stall?')
    .setChoiceValues(['Yes', 'No'])
    .setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Will you bring your own table and chairs?')
    .setChoiceValues(['Yes', 'No, I need them provided'])
    .setRequired(true);
  form.addTextItem()
    .setTitle('How many people will staff your stall?')
    .setValidation(FormApp.createTextValidation()
      .setHelpText('Please enter a number.')
      .requireWholeNumber()
      .build())
    .setRequired(true);
  form.addCheckboxItem()
    .setTitle('Would you also like a stall at our other upcoming events?')
    .setChoiceValues([
      'Young Entrepreneurs Networking Brunch (Sunday 29 November)',
      'Community Picnic (Saturday 19 December)',
      'Not at the moment'
    ])
    .setRequired(false);
  form.addParagraphTextItem()
    .setTitle('Anything else we should know?')
    .setRequired(false);

  // Route each group to its own page.
  role.setChoices([
    role.createChoice('Attendee', attendeePage),
    role.createChoice('Volunteer', volunteerPage),
    role.createChoice('Vendor', vendorPage)
  ]);

  // Collect every response in one Google Sheet.
  var sheet = SpreadsheetApp.create(EVENT_NAME + ' Registrations (Responses)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  // Newer Google accounts create forms unpublished; publish it so people can respond.
  try { form.setPublished(true); } catch (e) { /* older accounts publish automatically */ }

  // Shareable links. The volunteer and vendor links open with that option already selected.
  var generalLink = form.getPublishedUrl();
  var volunteerLink = form.createResponse()
    .withItemResponse(role.createResponse('Volunteer')).toPrefilledUrl();
  var vendorLink = form.createResponse()
    .withItemResponse(role.createResponse('Vendor')).toPrefilledUrl();
  var attendeeLink = form.createResponse()
    .withItemResponse(role.createResponse('Attendee')).toPrefilledUrl();

  Logger.log('GENERAL REGISTRATION LINK: ' + shorten_(form, generalLink));
  Logger.log('ATTENDEE LINK:             ' + shorten_(form, attendeeLink));
  Logger.log('VOLUNTEER LINK:            ' + shorten_(form, volunteerLink));
  Logger.log('VENDOR LINK:               ' + shorten_(form, vendorLink));
  Logger.log('EDIT THE FORM:             ' + form.getEditUrl());
  Logger.log('RESPONSES SPREADSHEET:     ' + sheet.getUrl());
}

function shorten_(form, url) {
  try { return form.shortenFormUrl(url); } catch (e) { return url; }
}

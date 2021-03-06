import React from "react";

import { MaterialBody, MaterialButtons, RestaurantMaterial } from "./styles";

import { OpeningHours } from "./elements/OpeningHours";
import { ContactInformation } from "./elements/ContactInformation";
import { RestaurantButtons } from "./elements/RestaurantButtons";
import { Padding, Spacing } from "../../../common-ui/layout";
import { HeadingLevel2, Text } from "../../../common-ui/text";

export const Restaurant = ({ data }) => (
  <RestaurantMaterial
    width="300px"
    height="300px"
    maxWidth="300px"
    maxHeight="300px"
    minWidth="300px"
    minHeight="300px"
  >
    <Padding>
      <MaterialBody>
        <HeadingLevel2>{data.name}</HeadingLevel2>
        <Spacing />
        <ContactInformation
          openStatus={_getOpenStatus(data)}
          openDisplayText={_getOpenDisplayText(data)}
          phoneNumber={data.formatted_phone_number}
          placeId={data.place_id}
          formattedAddress={_getOnlyAddress(data.formatted_address)}
        />
        <Spacing />
        {_getOpenStatus(data) !== "unknown" ? (
          <OpeningHours openingHours={_getOpeningHoursData(data)} />
        ) : (
          <Text>{data.name} har inga öppetider från Google</Text>
        )}
      </MaterialBody>
      <MaterialButtons>
        <RestaurantButtons linkToMenu={data.link_to_menu} />
      </MaterialButtons>
    </Padding>
  </RestaurantMaterial>
);

function _getOnlyAddress(fullAddress) {
  return fullAddress.split(",")[0];
}

function _getOpenStatus(data) {
  return data["opening_hours"]["periods"] == null
    ? "unknown"
    : _isOpen(data)
      ? "open"
      : "closed";
}

function _getOpenDisplayText(data) {
  const hasOpeningHours = _getOpenStatus(data) !== "unknown";
  const open = _isOpen(data);

  if (!hasOpeningHours) {
    return "Okänt";
  }

  if (!open) {
    return "Stängt";
  }

  const now = new Date();
  const day = now.getDay();
  const openingHoursToday = data.opening_hours.periods.find(
    period => parseInt(period.open.day, 10) === parseInt(day, 10)
  );

  var hours = now.getHours();

  if (parseInt(hours) < 10) {
    hours = "0" + hours;
  }

  const currentTime = hours + "" + now.getMinutes();
  var openingTime = openingHoursToday.open.time;
  var closingTime = openingHoursToday.close.time;

  const tempClosingTime = _getTempClosingTime(openingTime, closingTime);

  if (currentTime < openingTime) {
    openingTime = openingTime.substr(0, 2) + ":" + openingTime.substr(2, 2);
    return "Öppnar klockan " + openingTime;
  } else if (currentTime > openingTime && currentTime < tempClosingTime) {
    closingTime = closingTime.substr(0, 2) + ":" + closingTime.substr(2, 2);
    return "Öppet tills " + closingTime;
  } else {
    return "Stängt";
  }
}

function _isOpen(data) {
  const hasOpeningHours = data["opening_hours"]["periods"] != undefined;

  if (!hasOpeningHours) {
    return false;
  }

  const now = new Date();
  const day = now.getDay();

  if (data.opening_hours == null) {
    return false;
  } else {
    const openingHoursToday = data.opening_hours.periods.find(
      period => parseInt(period.open.day, 10) === parseInt(day, 10)
    );

    var hours = now.getHours();

    if (parseInt(hours) < 10) {
      hours = "0" + hours;
    }

    const currentTime = hours + "" + now.getMinutes();

    if (openingHoursToday == null) {
      return false;
    }

    var openingTime = openingHoursToday.open.time;
    var closingTime = openingHoursToday.close.time;

    const tempClosingTime = _getTempClosingTime(openingTime, closingTime);

    if (currentTime > openingTime && currentTime < tempClosingTime) {
      return true;
    } else {
      return false;
    }
  }
}

function _getTempClosingTime(openingTime, closingTime) {
  return closingTime < openingTime
    ? parseInt(closingTime.split(":")[0], 10) +
        24 +
        ":" +
        closingTime.split(":")[1]
    : closingTime; //Because 15:00 > 00.00
}

function _getOpeningHoursData(data) {
  const hasOpeningHours = data["opening_hours"]["periods"] != undefined;

  if (!hasOpeningHours) {
    return [];
  }

  const openingHoursData = [];

  for (var i = 0; i < 7; i++) {
    var weekday = data.opening_hours.weekday_text[i];

    const day = weekday.split(" ")[0].replace(":", "");
    const openingHours = weekday.split(" ")[1].split("–")[0];
    const closingHours = weekday.split(" ")[1].split("–")[1];

    //If empty, add and just move on
    if (openingHoursData.length === 0) {
      openingHoursData.push({
        startDay: day,
        endDay: day,
        openingHours: openingHours,
        closingHours: closingHours
      });
      continue;
    }

    var openingHourData = openingHoursData[openingHoursData.length - 1];
    if (
      openingHours === openingHourData.openingHours &&
      closingHours === openingHourData.closingHours
    ) {
      openingHoursData[openingHoursData.length - 1].endDay = day;
    } else {
      openingHoursData.push({
        startDay: day,
        endDay: day,
        openingHours: openingHours,
        closingHours: closingHours
      });
    }
  }
  return openingHoursData;
}

import { Commons } from "../src/commons";
import { SlackModule } from "../src/slackModule";
import { HipChatModule } from "../src/hipChatModule";

export function deepCopy(o: Object) {
  return JSON.parse(JSON.stringify(o));
}

export function compareKeys(objectA: any, objectB: any): boolean {
  const aKeys = Object.keys(objectA).sort();
  const bKeys = Object.keys(objectB).sort();
  return JSON.stringify(aKeys) === JSON.stringify(bKeys);
}

export const validSlackMessage = new SlackModule.SlackMessage(
  "ItoB7oEyZIbNmHPfxHQ2GrbC",
  "T0001",
  "example",
  "C2147483705",
  "test",
  "U2147483697",
  "Steve",
  "/10bis",
  "דיקסי"
);

export const validHipChatMessage = new HipChatModule.HipChatReqBody(
  "room_message",
  new HipChatModule.HipChatReqItem(
    new HipChatModule.HipChatReqItemMessage(
      new Date("2015-01-20T22:45:06.662545+00:00"),
      new HipChatModule.HipChatReqItemMessageFrom(
        1661743,
        "Blinky",
        "Blinky the Three Eyed Fish"
      ),
      "00a3eb7f-fac5-496a-8d64-a9050c712ca1",
      [],
      "/10bis דיקסי",
      "message"
    ),
    new HipChatModule.HipChatReqItemRoom(1147567, "The Weather Channel")
  ),
  578829
);

export const slackInvalidMessage = new SlackModule.SlackMessage(
  "ItoB7oEyZIbNmHPfxHQ2GrbC",
  "T0001",
  "example",
  "C2147483705",
  "test",
  "U2147483697",
  "Steve",
  null,
  null
);

export const hipChatInvalidMessage = new HipChatModule.HipChatReqBody(
  "room_message",
  new HipChatModule.HipChatReqItem(
    new HipChatModule.HipChatReqItemMessage(
      new Date("2015-01-20T22:45:06.662545+00:00"),
      new HipChatModule.HipChatReqItemMessageFrom(
        1661743,
        "Blinky",
        "Blinky the Three Eyed Fish"
      ),
      "00a3eb7f-fac5-496a-8d64-a9050c712ca1",
      [],
      null,
      "message"
    ),
    new HipChatModule.HipChatReqItemRoom(1147567, "The Weather Channel")
  ),
  578829
);

export const restaurants: Commons.Restaurant[] = [
  new Commons.RestaurantBuilder()
    .setRestaurantId(13048)
    .setRestaurantName("גוטה בריא ומהיר")
    .setRestaurantAddress("תובל 19 רמת גן")
    .setRestaurantCityName("רמת גן")
    .setRestaurantLogoUrl(
      "https://d25t2285lxl5rf.cloudfront.net/images/shops/13048.gif"
    )
    .setRestaurantPhone("03-5440053")
    .setRestaurantCuisineList("אוכל ביתי) בשרים) סלטים/סנדוויצ`ים")
    .setNumOfReviews(3490)
    .setReviewsRank(8)
    .setDistanceFromUser("874.89 מטרים")
    .setDistanceFromUserInMeters(874.8921943511485)
    .setIsOpenForDelivery(true)
    .setIsOpenForPickup(false)
    .setMinimumOrder("₪140.00")
    .setMinimumPriceForOrder(140)
    .setDeliveryPrice("חינם")
    .setDeliveryPriceForOrder(0)
    .setIsKosher("כשר")
    .setRestaurantKosher("המסעדה כשרה")
    .setDeliveryRemarks("חלוקת משלוחים החל מ 11:30")
    .setResGeoLocation_lon(34.8021509)
    .setResGeoLocation_lat(32.0848375)
    .setHappyHourDiscount("")
    .setHappyHourDiscountPercent(0)
    .setDeliveryChargeValueType(0)
    .setHappyHourDiscountValidityString("תקף עד 00:00")
    .setStartOrderURL(null)
    .setActivityHours("08:00 - 16:00")
    .setPickupActivityHours("00:00 - 00:00")
    .setDeliveryTime("עד 75 דק'")
    .setArrivalDeliveryTime("11:32 - 11:17")
    .setEstimatedDeliveryTime("עד 75 דק'")
    .setArrivalEstimatedDeliveryTime("11:32 - 11:17")
    .setShowEstimatedDeliveryTimes(true)
    .setIsHappyHourActive(false)
    .setIsPromotionActive(false)
    .setCompanyFlag(false)
    .setIsOverPoolMin(false)
    .setPoolSum("₪ 0.00")
    .setPoolSumNumber(0)
    .setDeliveryEndTime("16:00")
    .setIsTerminalActive(true)
    .setIsActiveForDelivery(true)
    .setIsActiveForPickup(true)
    .setBookmarked(false)
    .setNumberOfBookmarked(489)
    .setDiscountCouponPercent(0)
    .setCouponHasRestrictions(false)
    .setHasLogo(true)
    .setResWebsiteMode(1)
    .setPriority(6)
    .setKosherCertificateImgUrl("")
    .setIsExpressRes(false)
    .setShowSEOTagsForRes(false)
    .setHappyHourResRulesDescription([])
    .setPhoneOrdersOnlyOnPortals(false)
    .setDeliveryStartTime("08:00")
    .setPickupStartTime("00:00")
    .setPickupEndTime("00:00")
    .build(),
  new Commons.RestaurantBuilder()
    .setRestaurantId(1238)
    .setRestaurantName("דיקסי")
    .setRestaurantAddress("תובל 19 רמת גן")
    .setRestaurantCityName("רמת גן")
    .setRestaurantLogoUrl(
      "https://d25t2285lxl5rf.cloudfront.net/images/shops/13048.gif"
    )
    .setRestaurantPhone("03-5440053")
    .setRestaurantCuisineList("אוכל ביתי) בשרים) סלטים/סנדוויצ`ים")
    .setNumOfReviews(531)
    .setReviewsRank(8)
    .setDistanceFromUser("874.89 מטרים")
    .setDistanceFromUserInMeters(500)
    .setIsOpenForDelivery(true)
    .setIsOpenForPickup(false)
    .setMinimumOrder("₪140.00")
    .setMinimumPriceForOrder(140)
    .setDeliveryPrice("חינם")
    .setDeliveryPriceForOrder(0)
    .setIsKosher("כשר")
    .setRestaurantKosher("המסעדה כשרה")
    .setDeliveryRemarks("חלוקת משלוחים החל מ 11:30")
    .setResGeoLocation_lon(34.8021509)
    .setResGeoLocation_lat(32.0848375)
    .setHappyHourDiscount("")
    .setHappyHourDiscountPercent(0)
    .setDeliveryChargeValueType(0)
    .setHappyHourDiscountValidityString("תקף עד 00:00")
    .setStartOrderURL(null)
    .setActivityHours("08:00 - 16:00")
    .setPickupActivityHours("00:00 - 00:00")
    .setDeliveryTime("עד 75 דק'")
    .setArrivalDeliveryTime("11:32 - 11:17")
    .setEstimatedDeliveryTime("עד 75 דק'")
    .setArrivalEstimatedDeliveryTime("11:32 - 11:17")
    .setShowEstimatedDeliveryTimes(true)
    .setIsHappyHourActive(false)
    .setIsPromotionActive(false)
    .setCompanyFlag(false)
    .setIsOverPoolMin(true)
    .setPoolSum("₪ 150.00")
    .setPoolSumNumber(150)
    .setDeliveryEndTime("16:00")
    .setIsTerminalActive(true)
    .setIsActiveForDelivery(true)
    .setIsActiveForPickup(true)
    .setBookmarked(false)
    .setNumberOfBookmarked(489)
    .setDiscountCouponPercent(0)
    .setCouponHasRestrictions(false)
    .setHasLogo(true)
    .setResWebsiteMode(1)
    .setPriority(6)
    .setKosherCertificateImgUrl("")
    .setIsExpressRes(false)
    .setShowSEOTagsForRes(false)
    .setHappyHourResRulesDescription([])
    .setPhoneOrdersOnlyOnPortals(false)
    .setDeliveryStartTime("08:00")
    .setPickupStartTime("00:00")
    .setPickupEndTime("00:00")
    .build(),
  new Commons.RestaurantBuilder()
    .setRestaurantId(123456)
    .setRestaurantName("השדרה")
    .setRestaurantAddress("תובל 19 רמת גן")
    .setRestaurantCityName("רמת גן")
    .setRestaurantLogoUrl(
      "https://d25t2285lxl5rf.cloudfront.net/images/shops/13048.gif"
    )
    .setRestaurantPhone("03-5440053")
    .setRestaurantCuisineList("אוכל ביתי) בשרים) סלטים/סנדוויצ`ים")
    .setNumOfReviews(531)
    .setReviewsRank(8)
    .setDistanceFromUser("874.89 מטרים")
    .setDistanceFromUserInMeters(1500)
    .setIsOpenForDelivery(true)
    .setIsOpenForPickup(false)
    .setMinimumOrder("₪140.00")
    .setMinimumPriceForOrder(140)
    .setDeliveryPrice("חינם")
    .setDeliveryPriceForOrder(0)
    .setIsKosher("כשר")
    .setRestaurantKosher("המסעדה כשרה")
    .setDeliveryRemarks("חלוקת משלוחים החל מ 11:30")
    .setResGeoLocation_lon(34.8021509)
    .setResGeoLocation_lat(32.0848375)
    .setHappyHourDiscount("")
    .setHappyHourDiscountPercent(0)
    .setDeliveryChargeValueType(0)
    .setHappyHourDiscountValidityString("תקף עד 00:00")
    .setStartOrderURL(null)
    .setActivityHours("08:00 - 16:00")
    .setPickupActivityHours("00:00 - 00:00")
    .setDeliveryTime("עד 75 דק'")
    .setArrivalDeliveryTime("11:32 - 11:17")
    .setEstimatedDeliveryTime("עד 75 דק'")
    .setArrivalEstimatedDeliveryTime("11:32 - 11:17")
    .setShowEstimatedDeliveryTimes(true)
    .setIsHappyHourActive(false)
    .setIsPromotionActive(false)
    .setCompanyFlag(false)
    .setIsOverPoolMin(false)
    .setPoolSum("₪ 95.00")
    .setPoolSumNumber(95)
    .setDeliveryEndTime("16:00")
    .setIsTerminalActive(true)
    .setIsActiveForDelivery(true)
    .setIsActiveForPickup(true)
    .setBookmarked(false)
    .setNumberOfBookmarked(489)
    .setDiscountCouponPercent(0)
    .setCouponHasRestrictions(false)
    .setHasLogo(true)
    .setResWebsiteMode(1)
    .setPriority(6)
    .setKosherCertificateImgUrl("")
    .setIsExpressRes(false)
    .setShowSEOTagsForRes(false)
    .setHappyHourResRulesDescription([])
    .setPhoneOrdersOnlyOnPortals(false)
    .setDeliveryStartTime("08:00")
    .setPickupStartTime("00:00")
    .setPickupEndTime("00:00")
    .build(),
];

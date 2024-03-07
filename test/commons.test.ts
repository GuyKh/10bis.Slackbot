/* eslint-env node, mocha */
/* eslint camelcase: "off" */

import {
  Commons,
  GenerateSearchRequest,
  GenerateGetTotalOrdersRequest,
  VerifyMessage,
  FilterByRestaurantName,
  FilterTotalOrders,
  SortRestaurantsByDistance,
} from "../src/commons.js";
import { HipChatModule } from "../src/hipChatModule.js";
import { SlackModule } from "../src/slackModule.js";
import { SlackMessageFormatter } from "../src/slackMessage.js";
import { HipChatMessageFormatter } from "../src/hipChatMessage.js";
import "mocha";
import { expect } from "chai";
import {
  restaurants,
  validSlackMessage,
  validHipChatMessage,
  slackInvalidMessage,
  hipChatInvalidMessage,
} from "./testCommons.js";

const slackMessageFormatter: Commons.MessageFormatter =
  SlackMessageFormatter.getInstance();
const hipChatMessageFormatter: Commons.MessageFormatter =
  HipChatMessageFormatter.getInstance();

export class Req {
  body: string;

  constructor(body: string) {
    this.body = body;
  }
}

describe("App", function () {
  it("verifyMessage() should return null if no items are passed in", function () {
    const req = new SlackModule.SlackRequest(validSlackMessage);

    expect(
      VerifyMessage(null, [slackMessageFormatter, hipChatMessageFormatter]),
    ).to.equal(null);
    expect(VerifyMessage(req, null)).to.equal(null);
  });

  it("verifyMessage() should return slackMessageFormatter if valid slack message is passed", function () {
    const req = new SlackModule.SlackRequest(validSlackMessage);
    expect(
      VerifyMessage(req, [slackMessageFormatter, hipChatMessageFormatter]),
    ).to.equal(slackMessageFormatter);
  });

  it("verifyMessage() should return hipChatMessage if valid HipChat message is passed", function () {
    const req = new HipChatModule.HipChatReq(validHipChatMessage);
    expect(
      VerifyMessage(req, [slackMessageFormatter, hipChatMessageFormatter]),
    ).to.equal(hipChatMessageFormatter);
  });

  it("verifyMessage() should return null if invalid Slack message is passed", function () {
    const req = new SlackModule.SlackRequest(slackInvalidMessage);
    expect(
      VerifyMessage(req, [slackMessageFormatter, hipChatMessageFormatter]),
    ).to.be.an("undefined");
  });

  it("verifyMessage() should return null if invalid HipChat message is passed", function () {
    const req = new HipChatModule.HipChatReq(hipChatInvalidMessage);
    expect(
      VerifyMessage(req, [slackMessageFormatter, hipChatMessageFormatter]),
    ).to.be.an("undefined");
  });

  it("generateSearchRequest() should return a valid request", function () {
    const generatedRequest: string = GenerateSearchRequest("Rest");

    expect(generatedRequest).not.to.equal(null);
    expect(generatedRequest.includes("searchPhrase=Rest")).to.equal(true);
  });

  it("generateGetTotalOrdersRequest() should return a valid request", function () {
    const generatedRequest: string = GenerateGetTotalOrdersRequest();

    expect(generatedRequest).not.to.equal(null);
    expect(generatedRequest.includes("deliveryMethod=Delivery")).to.equal(true);
  });

  it("filterByRestaurantName() should filter restaurants with the same name", function () {
    const restaurant1: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest1")
      .setRestaurantId(1)
      .build();
    const restaurant2: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest2")
      .setRestaurantId(2)
      .build();
    const restaurant3: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest1")
      .setRestaurantId(3)
      .build();

    const restaurants: Commons.Restaurant[] = FilterByRestaurantName(
      [restaurant1, restaurant2, restaurant3],
      false,
      null,
    );

    expect(restaurants).not.to.equal(null);
    expect(restaurants.length).to.equal(2);
    expect(
      restaurants.some(function (element: Commons.Restaurant) {
        return element.RestaurantName === restaurant1.RestaurantName;
      }),
    ).to.equal(true);
    expect(
      restaurants.some(function (element: Commons.Restaurant) {
        return element.RestaurantName === restaurant2.RestaurantName;
      }),
    ).to.equal(true);
  });

  it("filterByRestaurantName() should be ok with an empty array", function () {
    const restaurants: Commons.Restaurant[] = FilterByRestaurantName(
      [],
      false,
      null,
    );

    expect(restaurants).not.to.equal(null);
    expect(restaurants.length).to.equal(0);
  });

  it("filterByRestaurantName() should filter restaurants with the same name", function () {
    const restaurant1: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest1")
      .setRestaurantId(1)
      .build();
    const restaurant2: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest2")
      .setRestaurantId(2)
      .build();
    const restaurant3: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest1")
      .setRestaurantId(3)
      .build();

    const restaurants: Commons.Restaurant[] = FilterByRestaurantName(
      [restaurant1, restaurant2, restaurant3],
      false,
      null,
    );

    expect(restaurants).not.to.equal(null);
    expect(restaurants.length).to.equal(2);
    expect(
      restaurants.some(function (element: Commons.Restaurant) {
        return element.RestaurantName === restaurant1.RestaurantName;
      }),
    ).to.equal(true);
    expect(
      restaurants.some(function (element: Commons.Restaurant) {
        return element.RestaurantName === restaurant2.RestaurantName;
      }),
    ).to.equal(true);
  });

  it("filterByRestaurantName() should filter restaurants by the same name", function () {
    const restaurant1: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest1")
      .setRestaurantId(1)
      .build();
    const restaurant2: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest2")
      .setRestaurantId(2)
      .build();
    const restaurant3: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest1")
      .setRestaurantId(3)
      .build();

    const restaurants: Commons.Restaurant[] = FilterByRestaurantName(
      [restaurant1, restaurant2, restaurant3],
      true,
      "Rest1",
    );

    expect(restaurants).not.to.equal(null);
    expect(restaurants.length).to.equal(1);
    expect(
      restaurants.some(function (element: Commons.Restaurant) {
        return element.RestaurantName === restaurant1.RestaurantName;
      }),
    ).to.equal(true);
  });

  it("sortRestaurantsByDistance() should sort restaurants by distance", function () {
    const restaurant1: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest1")
      .setRestaurantId(1)
      .setDistanceFromUserInMeters(10)
      .build();

    const restaurant2: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest2")
      .setRestaurantId(2)
      .setDistanceFromUserInMeters(20)
      .build();

    const restaurant3: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest3")
      .setRestaurantId(1)
      .setDistanceFromUserInMeters(15)
      .build();

    const restaurants: Commons.Restaurant[] = SortRestaurantsByDistance([
      restaurant1,
      restaurant2,
      restaurant3,
    ]);

    expect(restaurants).not.to.equal(null);
    expect(restaurants.length).to.equal(3);
    expect(restaurants[0].RestaurantName).to.be.equal(
      restaurant1.RestaurantName,
    );
    expect(restaurants[1].RestaurantName).to.be.equal(
      restaurant3.RestaurantName,
    );
    expect(restaurants[2].RestaurantName).to.be.equal(
      restaurant2.RestaurantName,
    );
  });

  it("sortRestaurantsByDistance() should sort restaurants by distance even when there are bad distances", function () {
    const restaurant4: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest4")
      .setRestaurantId(4)
      .setDistanceFromUserInMeters(25)
      .build();

    const restaurant1: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest1")
      .setRestaurantId(1)
      .build();

    const restaurant2: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest2")
      .setRestaurantId(2)
      .setDistanceFromUserInMeters(15)
      .build();

    const restaurant3: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest3")
      .setRestaurantId(1)
      .build();

    const restaurants: Commons.Restaurant[] = SortRestaurantsByDistance([
      restaurant4,
      restaurant1,
      restaurant2,
      restaurant3,
    ]);

    expect(restaurants).not.to.equal(null);
    expect(restaurants.length).to.equal(4);
    expect(restaurants[0].RestaurantName).to.be.equal(
      restaurant2.RestaurantName,
    );
    expect(restaurants[1].RestaurantName).to.be.equal(
      restaurant4.RestaurantName,
    );
    expect(restaurants[2].RestaurantName).to.be.equal(
      restaurant1.RestaurantName,
    );
    expect(restaurants[3].RestaurantName).to.be.equal(
      restaurant3.RestaurantName,
    );
  });

  it("sortRestaurantsByDistance() should do nothing when fields are equal", function () {
    const restaurant1: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest1")
      .setRestaurantId(1)
      .setDistanceFromUserInMeters(15)
      .build();

    const restaurant2: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest2")
      .setRestaurantId(2)
      .setDistanceFromUserInMeters(7)
      .build();

    const restaurant3: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest3")
      .setRestaurantId(3)
      .setDistanceFromUserInMeters(7)
      .build();

    const restaurants: Commons.Restaurant[] = SortRestaurantsByDistance([
      restaurant1,
      restaurant2,
      restaurant3,
    ]);

    expect(restaurants).not.to.equal(null);
    expect(restaurants.length).to.equal(3);
    expect(restaurants[0].RestaurantName).to.be.equal(
      restaurant2.RestaurantName,
    );
    expect(restaurants[1].RestaurantName).to.be.equal(
      restaurant3.RestaurantName,
    );
    expect(restaurants[2].RestaurantName).to.be.equal(
      restaurant1.RestaurantName,
    );
  });

  it("sortRestaurantsByDistance() should do nothing when no field", function () {
    const restaurant1: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest1")
      .setRestaurantId(1)
      .build();
    const restaurant2: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest2")
      .setRestaurantId(2)
      .build();
    const restaurant3: Commons.Restaurant = new Commons.RestaurantBuilder()
      .setRestaurantName("Rest3")
      .setRestaurantId(3)
      .build();

    const restaurants = SortRestaurantsByDistance([
      restaurant1,
      restaurant2,
      restaurant3,
    ]);

    expect(restaurants).not.to.equal(null);
    expect(restaurants.length).to.equal(3);
    expect(restaurants[0].RestaurantName).to.be.equal(
      restaurant1.RestaurantName,
    );
    expect(restaurants[1].RestaurantName).to.be.equal(
      restaurant2.RestaurantName,
    );
    expect(restaurants[2].RestaurantName).to.be.equal(
      restaurant3.RestaurantName,
    );
  });

  it("filterTotalOrders() should filter the restaurants correctly", function () {
    const filteredRestaurants: Commons.Restaurant[] =
      restaurants.filter(FilterTotalOrders);

    expect(filteredRestaurants).not.to.equal(null);
    expect(filteredRestaurants.length).to.equal(2);
    filteredRestaurants.forEach(function (restaurant: Commons.Restaurant) {
      expect(restaurant.PoolSumNumber > 0).to.be.equal(true);
      expect(restaurant.IsOverPoolMin).to.be.equal(
        restaurant.PoolSumNumber >= restaurant.MinimumPriceForOrder,
      );
    });
  });

  it("Restaurant setters should work", function () {
    const RestaurantId = 13048;
    const RestaurantName = "גוטה בריא ומהיר";
    const RestaurantAddress = "תובל 19 רמת גן";
    const RestaurantCityName = "רמת גן";
    const RestaurantLogoUrl =
      "https://d25t2285lxl5rf.cloudfront.net/images/shops/13048.gif";
    const RestaurantPhone = "03-5440053";
    const RestaurantCuisineList = "אוכל ביתי) בשרים) סלטים/סנדוויצ`ים";
    const NumOfReviews = 3490;
    const ReviewsRank = 8;
    const DistanceFromUser = "874.89 מטרים";
    const DistanceFromUserInMeters = 874.8921943511485;
    const IsOpenForDelivery = true;
    const IsOpenForPickup = false;
    const MinimumOrder = "₪140.00";
    const MinimumPriceForOrder = 140;
    const DeliveryPrice = "חינם";
    const DeliveryPriceForOrder = 0;
    const IsKosher = "כשר";
    const RestaurantKosher = "המסעדה כשרה";
    const DeliveryRemarks = "חלוקת משלוחים החל מ 11:30";
    const ResGeoLocation_lon = 34.8021509;
    const ResGeoLocation_lat = 32.0848375;
    const HappyHourDiscount = "";
    const HappyHourDiscountPercent = 0;
    const DeliveryChargeValueType = 0;
    const HappyHourDiscountValidityString = "תקף עד 00:00";
    const StartOrderURL = null;
    const ActivityHours = "08:00 - 16:00";
    const PickupActivityHours = "00:00 - 00:00";
    const DeliveryTime = "עד 75 דק'";
    const ArrivalDeliveryTime = "11:32 - 11:17";
    const EstimatedDeliveryTime = "עד 75 דק'";
    const ArrivalEstimatedDeliveryTime = "11:32 - 11:17";
    const ShowEstimatedDeliveryTimes = true;
    const IsHappyHourActive = false;
    const IsPromotionActive = false;
    const CompanyFlag = false;
    const IsOverPoolMin = false;
    const PoolSum = "₪ 0.00";
    const PoolSumNumber = 0;
    const DeliveryEndTime = "16:00";
    const IsTerminalActive = true;
    const IsActiveForDelivery = true;
    const IsActiveForPickup = true;
    const Bookmarked = false;
    const NumberOfBookmarked = 489;
    const DiscountCouponPercent = 0;
    const CouponHasRestrictions = false;
    const HasLogo = true;
    const ResWebsiteMode = 1;
    const Priority = 6;
    const KosherCertificateImgUrl = "";
    const IsExpressRes = false;
    const ShowSEOTagsForRes = false;
    const HappyHourResRulesDescription = [];
    const PhoneOrdersOnlyOnPortals = false;
    const DeliveryStartTime = "08:00";
    const PickupStartTime = "00:00";
    const PickupEndTime = "00:00";

    const restaurant = new Commons.Restaurant(new Commons.RestaurantBuilder());

    restaurant.RestaurantId = RestaurantId;
    restaurant.RestaurantName = RestaurantName;
    restaurant.RestaurantAddress = RestaurantAddress;
    restaurant.RestaurantCityName = RestaurantCityName;
    restaurant.RestaurantLogoUrl = RestaurantLogoUrl;
    restaurant.RestaurantPhone = RestaurantPhone;
    restaurant.RestaurantCuisineList = RestaurantCuisineList;
    restaurant.NumOfReviews = NumOfReviews;
    restaurant.ReviewsRank = ReviewsRank;
    restaurant.DistanceFromUser = DistanceFromUser;
    restaurant.DistanceFromUserInMeters = DistanceFromUserInMeters;
    restaurant.IsOpenForDelivery = IsOpenForDelivery;
    restaurant.IsOpenForPickup = IsOpenForPickup;
    restaurant.MinimumOrder = MinimumOrder;
    restaurant.MinimumPriceForOrder = MinimumPriceForOrder;
    restaurant.DeliveryPrice = DeliveryPrice;
    restaurant.DeliveryPriceForOrder = DeliveryPriceForOrder;
    restaurant.IsKosher = IsKosher;
    restaurant.RestaurantKosher = RestaurantKosher;
    restaurant.DeliveryRemarks = DeliveryRemarks;
    restaurant.ResGeoLocation_lon = ResGeoLocation_lon;
    restaurant.ResGeoLocation_lat = ResGeoLocation_lat;
    restaurant.HappyHourDiscount = HappyHourDiscount;
    restaurant.HappyHourDiscountPercent = HappyHourDiscountPercent;
    restaurant.DeliveryChargeValueType = DeliveryChargeValueType;
    restaurant.HappyHourDiscountValidityString =
      HappyHourDiscountValidityString;
    restaurant.StartOrderURL = StartOrderURL;
    restaurant.ActivityHours = ActivityHours;
    restaurant.PickupActivityHours = PickupActivityHours;
    restaurant.DeliveryTime = DeliveryTime;
    restaurant.ArrivalDeliveryTime = ArrivalDeliveryTime;
    restaurant.EstimatedDeliveryTime = EstimatedDeliveryTime;
    restaurant.ArrivalEstimatedDeliveryTime = ArrivalEstimatedDeliveryTime;
    restaurant.ShowEstimatedDeliveryTimes = ShowEstimatedDeliveryTimes;
    restaurant.IsHappyHourActive = IsHappyHourActive;
    restaurant.IsPromotionActive = IsPromotionActive;
    restaurant.CompanyFlag = CompanyFlag;
    restaurant.IsOverPoolMin = IsOverPoolMin;
    restaurant.PoolSum = PoolSum;
    restaurant.PoolSumNumber = PoolSumNumber;
    restaurant.DeliveryEndTime = DeliveryEndTime;
    restaurant.IsTerminalActive = IsTerminalActive;
    restaurant.IsActiveForDelivery = IsActiveForDelivery;
    restaurant.IsActiveForPickup = IsActiveForPickup;
    restaurant.Bookmarked = Bookmarked;
    restaurant.NumberOfBookmarked = NumberOfBookmarked;
    restaurant.DiscountCouponPercent = DiscountCouponPercent;
    restaurant.CouponHasRestrictions = CouponHasRestrictions;
    restaurant.HasLogo = HasLogo;
    restaurant.ResWebsiteMode = ResWebsiteMode;
    restaurant.Priority = Priority;
    restaurant.KosherCertificateImgUrl = KosherCertificateImgUrl;
    restaurant.IsExpressRes = IsExpressRes;
    restaurant.ShowSEOTagsForRes = ShowSEOTagsForRes;
    restaurant.HappyHourResRulesDescription = HappyHourResRulesDescription;
    restaurant.PhoneOrdersOnlyOnPortals = PhoneOrdersOnlyOnPortals;
    restaurant.DeliveryStartTime = DeliveryStartTime;
    restaurant.PickupStartTime = PickupStartTime;
    restaurant.PickupEndTime = PickupEndTime;

    expect(restaurant).to.to.deep.equal(restaurants[0]);
    expect(restaurant.RestaurantId).to.be.equal(RestaurantId);
    expect(restaurant.RestaurantName).to.be.equal(RestaurantName);
    expect(restaurant.RestaurantAddress).to.be.equal(RestaurantAddress);
    expect(restaurant.RestaurantCityName).to.be.equal(RestaurantCityName);
    expect(restaurant.RestaurantLogoUrl).to.be.equal(RestaurantLogoUrl);
    expect(restaurant.RestaurantPhone).to.be.equal(RestaurantPhone);
    expect(restaurant.RestaurantCuisineList).to.be.equal(RestaurantCuisineList);
    expect(restaurant.NumOfReviews).to.be.equal(NumOfReviews);
    expect(restaurant.ReviewsRank).to.be.equal(ReviewsRank);
    expect(restaurant.DistanceFromUser).to.be.equal(DistanceFromUser);
    expect(restaurant.DistanceFromUserInMeters).to.be.equal(
      DistanceFromUserInMeters,
    );
    expect(restaurant.IsOpenForDelivery).to.be.equal(IsOpenForDelivery);
    expect(restaurant.IsOpenForPickup).to.be.equal(IsOpenForPickup);
    expect(restaurant.MinimumOrder).to.be.equal(MinimumOrder);
    expect(restaurant.MinimumPriceForOrder).to.be.equal(MinimumPriceForOrder);
    expect(restaurant.DeliveryPrice).to.be.equal(DeliveryPrice);
    expect(restaurant.DeliveryPriceForOrder).to.be.equal(DeliveryPriceForOrder);
    expect(restaurant.IsKosher).to.be.equal(IsKosher);
    expect(restaurant.RestaurantKosher).to.be.equal(RestaurantKosher);
    expect(restaurant.DeliveryRemarks).to.be.equal(DeliveryRemarks);
    expect(restaurant.ResGeoLocation_lat).to.be.equal(ResGeoLocation_lat);
    expect(restaurant.ResGeoLocation_lon).to.be.equal(ResGeoLocation_lon);
    expect(restaurant.HappyHourDiscount).to.be.equal(HappyHourDiscount);
    expect(restaurant.HappyHourDiscountPercent).to.be.equal(
      HappyHourDiscountPercent,
    );
    expect(restaurant.DeliveryChargeValueType).to.be.equal(
      DeliveryChargeValueType,
    );
    expect(restaurant.HappyHourDiscountValidityString).to.be.equal(
      HappyHourDiscountValidityString,
    );
    expect(restaurant.StartOrderURL).to.be.equal(StartOrderURL);
    expect(restaurant.ActivityHours).to.be.equal(ActivityHours);
    expect(restaurant.PickupActivityHours).to.be.equal(PickupActivityHours);
    expect(restaurant.DeliveryTime).to.be.equal(DeliveryTime);
    expect(restaurant.ArrivalDeliveryTime).to.be.equal(ArrivalDeliveryTime);
    expect(restaurant.EstimatedDeliveryTime).to.be.equal(EstimatedDeliveryTime);
    expect(restaurant.ArrivalEstimatedDeliveryTime).to.be.equal(
      ArrivalEstimatedDeliveryTime,
    );
    expect(restaurant.ShowEstimatedDeliveryTimes).to.be.equal(
      ShowEstimatedDeliveryTimes,
    );
    expect(restaurant.IsHappyHourActive).to.be.equal(IsHappyHourActive);
    expect(restaurant.IsPromotionActive).to.be.equal(IsPromotionActive);
    expect(restaurant.CompanyFlag).to.be.equal(CompanyFlag);
    expect(restaurant.IsOverPoolMin).to.be.equal(IsOverPoolMin);
    expect(restaurant.PoolSum).to.be.equal(PoolSum);
    expect(restaurant.PoolSumNumber).to.be.equal(PoolSumNumber);
    expect(restaurant.DeliveryEndTime).to.be.equal(DeliveryEndTime);
    expect(restaurant.IsTerminalActive).to.be.equal(IsTerminalActive);
    expect(restaurant.IsActiveForDelivery).to.be.equal(IsActiveForDelivery);
    expect(restaurant.IsActiveForPickup).to.be.equal(IsActiveForPickup);
    expect(restaurant.Bookmarked).to.be.equal(Bookmarked);
    expect(restaurant.NumberOfBookmarked).to.be.equal(NumberOfBookmarked);
    expect(restaurant.DiscountCouponPercent).to.be.equal(DiscountCouponPercent);
    expect(restaurant.CouponHasRestrictions).to.be.equal(CouponHasRestrictions);
    expect(restaurant.HasLogo).to.be.equal(HasLogo);
    expect(restaurant.ResWebsiteMode).to.be.equal(ResWebsiteMode);
    expect(restaurant.Priority).to.be.equal(Priority);
    expect(restaurant.KosherCertificateImgUrl).to.be.equal(
      KosherCertificateImgUrl,
    );
    expect(restaurant.IsExpressRes).to.be.equal(IsExpressRes);
    expect(restaurant.ShowSEOTagsForRes).to.be.equal(ShowSEOTagsForRes);
    expect(restaurant.HappyHourResRulesDescription).to.be.equal(
      HappyHourResRulesDescription,
    );
    expect(restaurant.PhoneOrdersOnlyOnPortals).to.be.equal(
      PhoneOrdersOnlyOnPortals,
    );
    expect(restaurant.DeliveryStartTime).to.be.equal(DeliveryStartTime);
    expect(restaurant.PickupStartTime).to.be.equal(PickupStartTime);
    expect(restaurant.PickupEndTime).to.be.equal(PickupEndTime);
  });
});

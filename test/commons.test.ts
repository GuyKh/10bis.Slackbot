import { Commons } from "../src/commons";
import { HipChatModule } from "../src/hipChatModule";
import { SlackModule } from "../src/slackModule";
import { SlackMessageFormatter } from "../src/slackMessage";
import { HipChatMessageFormatter } from "../src/hipChatMessage";
import "mocha";
import { expect } from "chai";
import { restaurants, validSlackMessage, validHipChatMessage, slackInvalidMessage, hipChatInvalidMessage } from "./testCommons";

var rewire = require("rewire");
var app = rewire("./../src/app.js");
var slackMessageFormatter = SlackMessageFormatter.getInstance();
var hipChatMessageFormatter = HipChatMessageFormatter.getInstance();

export class Req {
    body: string;

    constructor (body: string) {
        this.body = body;
    }
}

describe("App", function () {
            it("verifyMessage() should return null if no items are passed in", function () {
                let req = new SlackModule.SlackRequest(validSlackMessage);

                expect(Commons.verifyMessage(null, [slackMessageFormatter, hipChatMessageFormatter])).to.equal(null);
                expect(Commons.verifyMessage(req, null)).to.equal(null);
            });

            it("verifyMessage() should return slackMessageFormatter if valid slack message is passed", function () {
                let req = new SlackModule.SlackRequest(validSlackMessage);
                expect(Commons.verifyMessage(req, [slackMessageFormatter, hipChatMessageFormatter])).to.equal(slackMessageFormatter);
            });

            it("verifyMessage() should return hipChatMessage if valid HipChat message is passed", function () {
                let req = new HipChatModule.HipChatReq(validHipChatMessage);
                expect(Commons.verifyMessage(req, [slackMessageFormatter, hipChatMessageFormatter])).to.equal(hipChatMessageFormatter);
            });

            it("verifyMessage() should return null if invalid Slack message is passed", function () {
                let req = new SlackModule.SlackRequest(slackInvalidMessage);
                expect(Commons.verifyMessage(req, [slackMessageFormatter, hipChatMessageFormatter])).to.be.an("undefined");
            });

            it("verifyMessage() should return null if invalid HipChat message is passed", function () {
                let req = new HipChatModule.HipChatReq(hipChatInvalidMessage);
                expect(Commons.verifyMessage(req, [slackMessageFormatter, hipChatMessageFormatter])).to.be.an("undefined");
            });


            it("generateSearchRequest() should return a valid request", function () {
                var generatedRequest = Commons.generateSearchRequest("Rest");

                expect(generatedRequest).not.to.equal(null);
                expect(generatedRequest.includes("searchPhrase=Rest")).to.equal(true);
            });

            it("generateGetTotalOrdersRequest() should return a valid request", function () {
                var generatedRequest = Commons.generateGetTotalOrdersRequest();

                expect(generatedRequest).not.to.equal(null);
                expect(generatedRequest.includes("deliveryMethod=Delivery")).to.equal(true);
            });

            it("filterByRestaurantName() should filter restaurants with the same name", function () {
                let restaurant1 : Commons.Restaurant = new Commons.RestaurantBuilder().setRestaurantName("Rest1").setRestaurantId(1).build();
                let restaurant2 : Commons.Restaurant  = new Commons.RestaurantBuilder().setRestaurantName("Rest2").setRestaurantId(2).build();
                let restaurant3 : Commons.Restaurant  = new Commons.RestaurantBuilder().setRestaurantName("Rest1").setRestaurantId(3).build();

                var result = Commons.filterByRestaurantName([restaurant1, restaurant2, restaurant3]);

                expect(result).not.to.equal(null);
                expect(result.length).to.equal(2);
                expect(result.some(function(element : Commons.Restaurant) {
                    return element.RestaurantName === restaurant1.RestaurantName;
                 })).to.equal(true);
                expect(result.some(function(element : Commons.Restaurant) {
                    return element.RestaurantName === restaurant2.RestaurantName;
                 })).to.equal(true);
            });

               it("filterByRestaurantName() should be ok with an empty array", function () {

                var result = Commons.filterByRestaurantName([]);

                expect(result).not.to.equal(null);
                expect(result.length).to.equal(0);
            });

            it("filterByRestaurantName() should filter restaurants with the same name", function () {
                let restaurant1 : Commons.Restaurant = new Commons.RestaurantBuilder().setRestaurantName("Rest1").setRestaurantId(1).build();
                let restaurant2 : Commons.Restaurant  = new Commons.RestaurantBuilder().setRestaurantName("Rest2").setRestaurantId(2).build();
                let restaurant3 : Commons.Restaurant  = new Commons.RestaurantBuilder().setRestaurantName("Rest1").setRestaurantId(3).build();

                var result = Commons.filterByRestaurantName([restaurant1, restaurant2, restaurant3]);

                expect(result).not.to.equal(null);
                expect(result.length).to.equal(2);
                expect(result.some(function(element : Commons.Restaurant) {
                    return element.RestaurantName === restaurant1.RestaurantName;
                })).to.equal(true);
                expect(result.some(function(element : Commons.Restaurant) {
                    return element.RestaurantName === restaurant2.RestaurantName;
                })).to.equal(true);
            });

            it("sortRestaurantsByDistance() should sort restaurants by distance", function () {
                var restaurant1 = new Commons.RestaurantBuilder()
                .setRestaurantName("Rest1")
                .setRestaurantId(1)
                .setDistanceFromUserInMeters(10)
                .build();

                var restaurant2 = new Commons.RestaurantBuilder()
                .setRestaurantName("Rest2")
                .setRestaurantId(2)
                .setDistanceFromUserInMeters(20)
                .build();

                var restaurant3 = new Commons.RestaurantBuilder()
                .setRestaurantName("Rest3")
                .setRestaurantId(1)
                .setDistanceFromUserInMeters(15)
                .build();

                var result = Commons.sortRestaurantsByDistance([restaurant1, restaurant2, restaurant3]);

                expect(result).not.to.equal(null);
                expect(result.length).to.equal(3);
                expect(result[0].RestaurantName).to.be.equal(restaurant1.RestaurantName);
                expect(result[1].RestaurantName).to.be.equal(restaurant3.RestaurantName);
                expect(result[2].RestaurantName).to.be.equal(restaurant2.RestaurantName);
            });

            it("sortRestaurantsByDistance() should sort restaurants by distance even when there are bad distances", function () {
                var restaurant4 = new Commons.RestaurantBuilder()
                .setRestaurantName("Rest4")
                .setRestaurantId(4)
                .setDistanceFromUserInMeters(25)
                .build();

                var restaurant1 = new Commons.RestaurantBuilder()
                .setRestaurantName("Rest1")
                .setRestaurantId(1)
                .build();

                var restaurant2 = new Commons.RestaurantBuilder()
                .setRestaurantName("Rest2")
                .setRestaurantId(2)
                .setDistanceFromUserInMeters(15)
                .build();

                var restaurant3 = new Commons.RestaurantBuilder()
                .setRestaurantName("Rest3")
                .setRestaurantId(1)
                .build();

                var result = Commons.sortRestaurantsByDistance([restaurant4, restaurant1, restaurant2, restaurant3]);

                expect(result).not.to.equal(null);
                expect(result.length).to.equal(4);
                expect(result[0].RestaurantName).to.be.equal(restaurant2.RestaurantName);
                expect(result[1].RestaurantName).to.be.equal(restaurant4.RestaurantName);
                expect(result[2].RestaurantName).to.be.equal(restaurant1.RestaurantName);
                expect(result[3].RestaurantName).to.be.equal(restaurant3.RestaurantName);
            });

            it("sortRestaurantsByDistance() should do nothing when fields are equal", function () {
                var restaurant1 = new Commons.RestaurantBuilder()
                .setRestaurantName("Rest1")
                .setRestaurantId(1)
                .setDistanceFromUserInMeters(15)
                .build();

                var restaurant2 = new Commons.RestaurantBuilder()
                .setRestaurantName("Rest2")
                .setRestaurantId(2)
                .setDistanceFromUserInMeters(7)
                .build();

                var restaurant3 = new Commons.RestaurantBuilder()
                .setRestaurantName("Rest3")
                .setRestaurantId(3)
                .setDistanceFromUserInMeters(7)
                .build();

                var result = Commons.sortRestaurantsByDistance([restaurant1, restaurant2, restaurant3]);

                expect(result).not.to.equal(null);
                expect(result.length).to.equal(3);
                expect(result[0].RestaurantName).to.be.equal(restaurant2.RestaurantName);
                expect(result[1].RestaurantName).to.be.equal(restaurant3.RestaurantName);
                expect(result[2].RestaurantName).to.be.equal(restaurant1.RestaurantName);
            });

            it("sortRestaurantsByDistance() should do nothing when no field", function () {
                let restaurant1 : Commons.Restaurant = new Commons.RestaurantBuilder().setRestaurantName("Rest1").setRestaurantId(1).build();
                let restaurant2 : Commons.Restaurant  = new Commons.RestaurantBuilder().setRestaurantName("Rest2").setRestaurantId(2).build();
                let restaurant3 : Commons.Restaurant  = new Commons.RestaurantBuilder().setRestaurantName("Rest3").setRestaurantId(3).build();


                var result = Commons.sortRestaurantsByDistance([restaurant1, restaurant2, restaurant3]);

                expect(result).not.to.equal(null);
                expect(result.length).to.equal(3);
                expect(result[0].RestaurantName).to.be.equal(restaurant1.RestaurantName);
                expect(result[1].RestaurantName).to.be.equal(restaurant2.RestaurantName);
                expect(result[2].RestaurantName).to.be.equal(restaurant3.RestaurantName);
            });

            it("filterTotalOrders() should filter the restaurants correctly", function () {
                var filteredRestaurants = restaurants.filter(Commons.filterTotalOrders);

                expect(filteredRestaurants).not.to.equal(null);
                expect(filteredRestaurants.length).to.equal(2);
                filteredRestaurants.forEach(function(restaurant : Commons.Restaurant) {
                    expect(restaurant.PoolSumNumber > 0).to.be.equal(true);
                    expect(restaurant.IsOverPoolMin).to.be.equal(true);
                });
            });

            it("Restaurant setters should work", function () {
                let RestaurantId = 13048 ;
                let RestaurantName = "גוטה בריא ומהיר" ;
                let RestaurantAddress = "תובל 19 רמת גן" ;
                let RestaurantCityName = "רמת גן" ;
                let RestaurantLogoUrl = "https://d25t2285lxl5rf.cloudfront.net/images/shops/13048.gif" ;
                let RestaurantPhone = "03-5440053" ;
                let RestaurantCuisineList = "אוכל ביתי) בשרים) סלטים/סנדוויצ`ים" ;
                let NumOfReviews = 3490 ;
                let ReviewsRank = 8 ;
                let DistanceFromUser = "874.89 מטרים" ;
                let DistanceFromUserInMeters = 874.8921943511485 ;
                let IsOpenForDelivery = true ;
                let IsOpenForPickup = false ;
                let MinimumOrder = "₪140.00" ;
                let MinimumPriceForOrder = 140 ;
                let DeliveryPrice = "חינם" ;
                let DeliveryPriceForOrder = 0 ;
                let IsKosher = "כשר" ;
                let RestaurantKosher = "המסעדה כשרה" ;
                let DeliveryRemarks = "חלוקת משלוחים החל מ 11:30" ;
                let ResGeoLocation_lon = 34.8021509 ;
                let ResGeoLocation_lat = 32.0848375 ;
                let HappyHourDiscount = "" ;
                let HappyHourDiscountPercent = 0 ;
                let DeliveryChargeValueType = 0 ;
                let HappyHourDiscountValidityString = "תקף עד 00:00" ;
                let StartOrderURL = null ;
                let ActivityHours = "08:00 - 16:00" ;
                let PickupActivityHours = "00:00 - 00:00" ;
                let DeliveryTime = "עד 75 דק'" ;
                let ArrivalDeliveryTime = "11:32 - 11:17" ;
                let EstimatedDeliveryTime = "עד 75 דק'" ;
                let ArrivalEstimatedDeliveryTime = "11:32 - 11:17" ;
                let ShowEstimatedDeliveryTimes = true ;
                let IsHappyHourActive = false ;
                let IsPromotionActive = false ;
                let CompanyFlag = false ;
                let IsOverPoolMin = false ;
                let PoolSum = "₪ 0.00" ;
                let PoolSumNumber = 0 ;
                let DeliveryEndTime = "16:00" ;
                let IsTerminalActive = true ;
                let IsActiveForDelivery = true ;
                let IsActiveForPickup = true ;
                let Bookmarked = false ;
                let NumberOfBookmarked = 489 ;
                let DiscountCouponPercent = 0 ;
                let CouponHasRestrictions = false ;
                let HasLogo = true ;
                let ResWebsiteMode = 1 ;
                let Priority = 6 ;
                let KosherCertificateImgUrl = "" ;
                let IsExpressRes = false ;
                let ShowSEOTagsForRes = false ;
                let HappyHourResRulesDescription = [] ;
                let PhoneOrdersOnlyOnPortals = false ;
                let DeliveryStartTime = "08:00" ;
                let PickupStartTime = "00:00" ;
                let PickupEndTime = "00:00" ;

                let restaurant = new Commons.Restaurant(new Commons.RestaurantBuilder());

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
                restaurant.ResGeoLocation_lon = ResGeoLocation_lon ;
                restaurant.ResGeoLocation_lat = ResGeoLocation_lat ;
                restaurant.HappyHourDiscount = HappyHourDiscount;
                restaurant.HappyHourDiscountPercent = HappyHourDiscountPercent;
                restaurant.DeliveryChargeValueType = DeliveryChargeValueType;
                restaurant.HappyHourDiscountValidityString = HappyHourDiscountValidityString;
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
                expect(restaurant.DistanceFromUserInMeters).to.be.equal(DistanceFromUserInMeters);
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
                expect(restaurant.HappyHourDiscountPercent).to.be.equal(HappyHourDiscountPercent);
                expect(restaurant.DeliveryChargeValueType).to.be.equal(DeliveryChargeValueType);
                expect(restaurant.HappyHourDiscountValidityString).to.be.equal(HappyHourDiscountValidityString);
                expect(restaurant.StartOrderURL).to.be.equal(StartOrderURL);
                expect(restaurant.ActivityHours).to.be.equal(ActivityHours);
                expect(restaurant.PickupActivityHours).to.be.equal(PickupActivityHours);
                expect(restaurant.DeliveryTime).to.be.equal(DeliveryTime);
                expect(restaurant.ArrivalDeliveryTime).to.be.equal(ArrivalDeliveryTime);
                expect(restaurant.EstimatedDeliveryTime).to.be.equal(EstimatedDeliveryTime);
                expect(restaurant.ArrivalEstimatedDeliveryTime).to.be.equal(ArrivalEstimatedDeliveryTime);
                expect(restaurant.ShowEstimatedDeliveryTimes).to.be.equal(ShowEstimatedDeliveryTimes);
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
                expect(restaurant.KosherCertificateImgUrl).to.be.equal(KosherCertificateImgUrl);
                expect(restaurant.IsExpressRes).to.be.equal(IsExpressRes);
                expect(restaurant.ShowSEOTagsForRes).to.be.equal(ShowSEOTagsForRes);
                expect(restaurant.HappyHourResRulesDescription).to.be.equal(HappyHourResRulesDescription);
                expect(restaurant.PhoneOrdersOnlyOnPortals).to.be.equal(PhoneOrdersOnlyOnPortals);
                expect(restaurant.DeliveryStartTime).to.be.equal(DeliveryStartTime);
                expect(restaurant.PickupStartTime).to.be.equal(PickupStartTime);
                expect(restaurant.PickupEndTime).to.be.equal(PickupEndTime);
            });

});
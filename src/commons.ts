import * as http from "http";
import { Request as ExpressRequest } from "express";
import * as moment from "moment-timezone";
import { Constants } from "./constants";
import * as url from "url";
import * as request from "request";
import { Send, Response } from "express";

export module Commons {
    export function getFormatedDateTime() : string {
        let date : string = moment.tz(Constants.TIMEZONE).format(Constants.DATE_FORMAT);
        let time : string = moment.tz(Constants.TIMEZONE).format(Constants.TIME_FORMAT);
        return date + "+" + time;
	}

	export function RequestGetWrapper(url : string) : Promise<string> {
		return new Promise(function (resolve : Function, reject : Function) {
			request.get(url, function(error : Error, response : Response, body : string) {
				if (!error && response.statusCode === 200) {
					resolve (body);		// Succeess
				} else {
					reject(error); 		// Failure
				}
			});
		});
	}

	export function ErrorPromiseWrapper(errorString : string) : Promise<void> {
		return new Promise(function (resolve : Function, reject : Function) {
			reject(errorString); // Failure
		});
	}

	export class SearchRequestQuery {
		deliveryMethod: string;
		ShowOnlyOpenForDelivery: boolean;
		id: number;
		pageNum: number;
		pageSize: number;
		OrderBy: string;
		cuisineType: string;
		CityId: number;
		StreetId: number;
		FilterByKosher: boolean;
		FilterByBookmark: boolean;
		FilterByCoupon: boolean;
		searchPhrase: string;
		Latitude: number;
		Longitude: number;
		HouseNumber: number;
		desiredDateAndTime: string;
		timestamp: number;
	}

	export function sortRestaurantsByDistance (restaurants : Commons.Restaurant[]) : Commons.Restaurant[] {
        return restaurants.sort(
            function(objectA : Commons.Restaurant, objectB : Commons.Restaurant) {
                if (!objectA.DistanceFromUserInMeters && objectB.DistanceFromUserInMeters) {
                    return 1;
                }
                if (objectA.DistanceFromUserInMeters && !objectB.DistanceFromUserInMeters) {
                    return -1;
                }
                if (!objectA.DistanceFromUserInMeters && !objectB.DistanceFromUserInMeters) {
                    return 0;
                }

                if (objectA.DistanceFromUserInMeters > objectB.DistanceFromUserInMeters) {
                    return 1;
                }
                if (objectB.DistanceFromUserInMeters > objectA.DistanceFromUserInMeters) {
                    return -1;
                }

                return 0;
            }
        );
	}

	export function filterTotalOrders (restarant : Commons.Restaurant) : boolean {
        // Filter all restaurants will positive pool value
        return restarant.PoolSumNumber > 0;
    }

	export function verifyMessage (req : Commons.Request, formatters : Commons.MessageFormatter[]) : Commons.MessageFormatter {
		if (!req || !formatters || formatters.constructor !== Array) {
			return null;
		}

		return formatters.find(function(formatter : Commons.MessageFormatter) {
			return formatter.isValidMessage(req);
		});
	}

	export function generateSearchRequest(restaurantName: string) : string {
        let query : Commons.SearchRequestQuery = new Commons.SearchRequestQuery();
        query.deliveryMethod = "Delivery";
        query.ShowOnlyOpenForDelivery = false;
        query.id = Number.parseInt(process.env.USER_ID);
        query.pageNum = 0;
        query.pageSize = 50;
        query.OrderBy = "Default";
        query.cuisineType = "";
        query.CityId = Number.parseInt(process.env.CITY_ID);
        query.StreetId = Number.parseInt(process.env.STREET_ID);
        query.FilterByKosher = false;
        query.FilterByBookmark = false;
        query.FilterByCoupon = false;
        query.searchPhrase = restaurantName;
        query.Latitude = Number.parseInt(process.env.LAT);
        query.Longitude = Number.parseInt(process.env.LONG);
        query.HouseNumber = Number.parseInt(process.env.HOUSE_NUMBER);
        query.desiredDateAndTime = Commons.getFormatedDateTime();
        query.timestamp = new Date().getTime();

        let parsedUrl : string = url.format(new URL("https://www.10bis.co.il/Restaurants/SearchRestaurants"));
        parsedUrl = parsedUrl.replace("%2B", "+");

        return parsedUrl;
    }

    export function generateGetTotalOrdersRequest() : string {
        let query : Commons.SearchRequestQuery = new Commons.SearchRequestQuery();
        query.deliveryMethod = "Delivery";
        query.ShowOnlyOpenForDelivery = false;
        query.id = Number.parseInt(process.env.USER_ID);
        query.pageNum = 0;
        query.pageSize = 50;
        query.OrderBy = "pool_sum";
        query.cuisineType = "";
        query.CityId = Number.parseInt(process.env.CITY_ID);
        query.StreetId = Number.parseInt(process.env.STREET_ID);
        query.FilterByKosher = false;
        query.FilterByBookmark = false;
        query.FilterByCoupon = false;
        query.searchPhrase = "";
        query.Latitude = Number.parseInt(process.env.LAT);
        query.Longitude = Number.parseInt(process.env.LONG);
        query.HouseNumber = Number.parseInt(process.env.HOUSE_NUMBER);
        query.desiredDateAndTime = Commons.getFormatedDateTime();
        query.timestamp = new Date().getTime();

       let parsedUrl : string = url.format({
            pathname: "https://www.10bis.co.il/Restaurants/SearchRestaurants",
            query: query
        });

        parsedUrl = parsedUrl.replace("%2B", "+");
        return parsedUrl;
	}

	export function filterByRestaurantName (restaurants : Commons.Restaurant[], findExact: boolean, restarantName : string) : Commons.Restaurant[] {
        let flags = {};
        let filteredRestaurants : Commons.Restaurant[] = restaurants.filter(function(restarant : Commons.Restaurant) {
            if (flags[restarant.RestaurantName]) {
                return false;
            }

            flags[restarant.RestaurantName] = true;
            return true;
        });

		if (!findExact) {
			return filteredRestaurants;
		} else {
        return filteredRestaurants.filter(function(restarant: Commons.Restaurant) {
			return restarant.RestaurantName === restarantName;
			});
		}
    }

    export class Restaurant {
        private _restaurantId: number;
        private _restaurantName: string;
        private _restaurantAddress: string;
        private _restaurantCityName: string;
        private _restaurantLogoUrl: string;
        private _restaurantPhone: string;
        private _restaurantCuisineList: string;
        private _numOfReviews: number;
        private _reviewsRank: number;
        private _distanceFromUser: string;
        private _distanceFromUserInMeters: number;
        private _isOpenForDelivery: boolean;
        private _isOpenForPickup: boolean;
        private _minimumOrder: string;
        private _minimumPriceForOrder: number;
        private _deliveryPrice: string;
        private _deliveryPriceForOrder: number;
        private _isKosher: string;
        private _restaurantKosher: string;
        private _deliveryRemarks: string;
        private _resGeoLocation_lon: number;
        private _resGeoLocation_lat: number;
        private _happyHourDiscount: string;
        private _happyHourDiscountPercent: number;
        private _deliveryChargeValueType: number;
        private _happyHourDiscountValidityString: string;
        private _startOrderURL: string;
        private _activityHours: string;
        private _pickupActivityHours: string;
        private _deliveryTime: string;
        private _arrivalDeliveryTime: string;
        private _estimatedDeliveryTime: string;
        private _arrivalEstimatedDeliveryTime: string;
        private _showEstimatedDeliveryTimes: boolean;
        private _isHappyHourActive: boolean;
        private _isPromotionActive: boolean;
        private _companyFlag: boolean;
        private _isOverPoolMin: boolean;
        private _poolSum: string;
        private _poolSumNumber: number;
        private _deliveryEndTime: string;
        private _isTerminalActive: boolean;
        private _isActiveForDelivery: boolean;
        private _isActiveForPickup: boolean;
        private _bookmarked: boolean;
        private _numberOfBookmarked: number;
        private _discountCouponPercent: number;
        private _couponHasRestrictions: boolean;
        private _hasLogo: boolean;
        private _resWebsiteMode: number;
        private _priority: number;
        private _kosherCertificateImgUrl: string;
        private _isExpressRes: boolean;
        private _showSEOTagsForRes: boolean;
        private _happyHourResRulesDescription: string[];
        private _phoneOrdersOnlyOnPortals: boolean;
        private _deliveryStartTime: string;
        private _pickupStartTime: string;
        private _pickupEndTime: string;


	constructor (restaurantBuilder : RestaurantBuilder) {
        this._restaurantId = restaurantBuilder.RestaurantId;
        this._restaurantName = restaurantBuilder.RestaurantName;
        this._restaurantAddress = restaurantBuilder.RestaurantAddress;
        this._restaurantCityName = restaurantBuilder.RestaurantCityName;
        this._restaurantLogoUrl = restaurantBuilder.RestaurantLogoUrl;
        this._restaurantPhone = restaurantBuilder.RestaurantPhone;
        this._restaurantCuisineList = restaurantBuilder.RestaurantCuisineList;
        this._numOfReviews = restaurantBuilder.NumOfReviews;
        this._reviewsRank = restaurantBuilder.ReviewsRank;
        this._distanceFromUser = restaurantBuilder.DistanceFromUser;
        this._distanceFromUserInMeters = restaurantBuilder.DistanceFromUserInMeters;
        this._isOpenForDelivery = restaurantBuilder.IsOpenForDelivery;
        this._isOpenForPickup = restaurantBuilder.IsOpenForPickup;
        this._minimumOrder = restaurantBuilder.MinimumOrder;
        this._minimumPriceForOrder = restaurantBuilder.MinimumPriceForOrder;
        this._deliveryPrice = restaurantBuilder.DeliveryPrice;
        this._deliveryPriceForOrder = restaurantBuilder.DeliveryPriceForOrder;
        this._isKosher = restaurantBuilder.IsKosher;
        this._restaurantKosher = restaurantBuilder.RestaurantKosher;
        this._deliveryRemarks = restaurantBuilder.DeliveryRemarks;
        this._resGeoLocation_lon = restaurantBuilder.ResGeoLocation_lon;
        this._resGeoLocation_lat = restaurantBuilder.ResGeoLocation_lat;
        this._happyHourDiscount = restaurantBuilder.HappyHourDiscount;
        this._happyHourDiscountPercent = restaurantBuilder.HappyHourDiscountPercent;
        this._deliveryChargeValueType = restaurantBuilder.DeliveryChargeValueType;
        this._happyHourDiscountValidityString = restaurantBuilder.HappyHourDiscountValidityString;
        this._startOrderURL = restaurantBuilder.StartOrderURL;
        this._activityHours = restaurantBuilder.ActivityHours;
        this._pickupActivityHours = restaurantBuilder.PickupActivityHours;
        this._deliveryTime = restaurantBuilder.DeliveryTime;
        this._arrivalDeliveryTime = restaurantBuilder.ArrivalDeliveryTime;
        this._estimatedDeliveryTime = restaurantBuilder.EstimatedDeliveryTime;
        this._arrivalEstimatedDeliveryTime = restaurantBuilder.ArrivalEstimatedDeliveryTime;
        this._showEstimatedDeliveryTimes = restaurantBuilder.ShowEstimatedDeliveryTimes;
        this._isHappyHourActive = restaurantBuilder.IsHappyHourActive;
        this._isPromotionActive = restaurantBuilder.IsPromotionActive;
        this._companyFlag = restaurantBuilder.CompanyFlag;
        this._isOverPoolMin = restaurantBuilder.IsOverPoolMin;
        this._poolSum = restaurantBuilder.PoolSum;
        this._poolSumNumber = restaurantBuilder.PoolSumNumber;
        this._deliveryEndTime = restaurantBuilder.DeliveryEndTime;
        this._isTerminalActive = restaurantBuilder.IsTerminalActive;
        this._isActiveForDelivery = restaurantBuilder.IsActiveForDelivery;
        this._isActiveForPickup = restaurantBuilder.IsActiveForPickup;
        this._bookmarked = restaurantBuilder.Bookmarked;
        this._numberOfBookmarked = restaurantBuilder.NumberOfBookmarked;
        this._discountCouponPercent = restaurantBuilder.DiscountCouponPercent;
        this._couponHasRestrictions = restaurantBuilder.CouponHasRestrictions;
        this._hasLogo = restaurantBuilder.HasLogo;
        this._resWebsiteMode = restaurantBuilder.ResWebsiteMode;
        this._priority = restaurantBuilder.Priority;
        this._kosherCertificateImgUrl = restaurantBuilder.KosherCertificateImgUrl;
        this._isExpressRes = restaurantBuilder.IsExpressRes;
        this._showSEOTagsForRes = restaurantBuilder.ShowSEOTagsForRes;
        this._happyHourResRulesDescription = restaurantBuilder.HappyHourResRulesDescription;
        this._phoneOrdersOnlyOnPortals = restaurantBuilder.PhoneOrdersOnlyOnPortals;
        this._deliveryStartTime = restaurantBuilder.DeliveryStartTime;
        this._pickupStartTime = restaurantBuilder.PickupStartTime;
        this._pickupEndTime = restaurantBuilder.PickupEndTime;
	}

	public get RestaurantId(): number {
		return this._restaurantId;
	}

	public set RestaurantId(value: number) {
		this._restaurantId = value;
	}

	public get RestaurantName(): string {
		return this._restaurantName;
	}

	public set RestaurantName(value: string) {
		this._restaurantName = value;
	}

	public get RestaurantAddress(): string {
		return this._restaurantAddress;
	}

	public set RestaurantAddress(value: string) {
		this._restaurantAddress = value;
	}

	public get RestaurantCityName(): string {
		return this._restaurantCityName;
	}

	public set RestaurantCityName(value: string) {
		this._restaurantCityName = value;
	}

	public get RestaurantLogoUrl(): string {
		return this._restaurantLogoUrl;
	}

	public set RestaurantLogoUrl(value: string) {
		this._restaurantLogoUrl = value;
	}

	public get RestaurantPhone(): string {
		return this._restaurantPhone;
	}

	public set RestaurantPhone(value: string) {
		this._restaurantPhone = value;
	}

	public get RestaurantCuisineList(): string {
		return this._restaurantCuisineList;
	}

	public set RestaurantCuisineList(value: string) {
		this._restaurantCuisineList = value;
	}

	public get NumOfReviews(): number {
		return this._numOfReviews;
	}

	public set NumOfReviews(value: number) {
		this._numOfReviews = value;
	}

	public get ReviewsRank(): number {
		return this._reviewsRank;
	}

	public set ReviewsRank(value: number) {
		this._reviewsRank = value;
	}

	public get DistanceFromUser(): string {
		return this._distanceFromUser;
	}

	public set DistanceFromUser(value: string) {
		this._distanceFromUser = value;
	}

	public get DistanceFromUserInMeters(): number {
		return this._distanceFromUserInMeters;
	}

	public set DistanceFromUserInMeters(value: number) {
		this._distanceFromUserInMeters = value;
	}

	public get IsOpenForDelivery(): boolean {
		return this._isOpenForDelivery;
	}

	public set IsOpenForDelivery(value: boolean) {
		this._isOpenForDelivery = value;
	}

	public get IsOpenForPickup(): boolean {
		return this._isOpenForPickup;
	}

	public set IsOpenForPickup(value: boolean) {
		this._isOpenForPickup = value;
	}

	public get MinimumOrder(): string {
		return this._minimumOrder;
	}

	public set MinimumOrder(value: string) {
		this._minimumOrder = value;
	}

	public get MinimumPriceForOrder(): number {
		return this._minimumPriceForOrder;
	}

	public set MinimumPriceForOrder(value: number) {
		this._minimumPriceForOrder = value;
	}

	public get DeliveryPrice(): string {
		return this._deliveryPrice;
	}

	public set DeliveryPrice(value: string) {
		this._deliveryPrice = value;
	}

	public get DeliveryPriceForOrder(): number {
		return this._deliveryPriceForOrder;
	}

	public set DeliveryPriceForOrder(value: number) {
		this._deliveryPriceForOrder = value;
	}

	public get IsKosher(): string {
		return this._isKosher;
	}

	public set IsKosher(value: string) {
		this._isKosher = value;
	}

	public get RestaurantKosher(): string {
		return this._restaurantKosher;
	}

	public set RestaurantKosher(value: string) {
		this._restaurantKosher = value;
	}

	public get DeliveryRemarks(): string {
		return this._deliveryRemarks;
	}

	public set DeliveryRemarks(value: string) {
		this._deliveryRemarks = value;
	}

	public get ResGeoLocation_lon(): number {
		return this._resGeoLocation_lon;
	}

	public set ResGeoLocation_lon(value: number) {
		this._resGeoLocation_lon = value;
	}

	public get ResGeoLocation_lat(): number {
		return this._resGeoLocation_lat;
	}

	public set ResGeoLocation_lat(value: number) {
		this._resGeoLocation_lat = value;
	}

	public get HappyHourDiscount(): string {
		return this._happyHourDiscount;
	}

	public set HappyHourDiscount(value: string) {
		this._happyHourDiscount = value;
	}

	public get HappyHourDiscountPercent(): number {
		return this._happyHourDiscountPercent;
	}

	public set HappyHourDiscountPercent(value: number) {
		this._happyHourDiscountPercent = value;
	}

	public get DeliveryChargeValueType(): number {
		return this._deliveryChargeValueType;
	}

	public set DeliveryChargeValueType(value: number) {
		this._deliveryChargeValueType = value;
	}

	public get HappyHourDiscountValidityString(): string {
		return this._happyHourDiscountValidityString;
	}

	public set HappyHourDiscountValidityString(value: string) {
		this._happyHourDiscountValidityString = value;
	}

	public get StartOrderURL(): string {
		return this._startOrderURL;
	}

	public set StartOrderURL(value: string) {
		this._startOrderURL = value;
	}

	public get ActivityHours(): string {
		return this._activityHours;
	}

	public set ActivityHours(value: string) {
		this._activityHours = value;
	}

	public get PickupActivityHours(): string {
		return this._pickupActivityHours;
	}

	public set PickupActivityHours(value: string) {
		this._pickupActivityHours = value;
	}

	public get DeliveryTime(): string {
		return this._deliveryTime;
	}

	public set DeliveryTime(value: string) {
		this._deliveryTime = value;
	}

	public get ArrivalDeliveryTime(): string {
		return this._arrivalDeliveryTime;
	}

	public set ArrivalDeliveryTime(value: string) {
		this._arrivalDeliveryTime = value;
	}

	public get EstimatedDeliveryTime(): string {
		return this._estimatedDeliveryTime;
	}

	public set EstimatedDeliveryTime(value: string) {
		this._estimatedDeliveryTime = value;
	}

	public get ArrivalEstimatedDeliveryTime(): string {
		return this._arrivalEstimatedDeliveryTime;
	}

	public set ArrivalEstimatedDeliveryTime(value: string) {
		this._arrivalEstimatedDeliveryTime = value;
	}

	public get ShowEstimatedDeliveryTimes(): boolean {
		return this._showEstimatedDeliveryTimes;
	}

	public set ShowEstimatedDeliveryTimes(value: boolean) {
		this._showEstimatedDeliveryTimes = value;
	}

	public get IsHappyHourActive(): boolean {
		return this._isHappyHourActive;
	}

	public set IsHappyHourActive(value: boolean) {
		this._isHappyHourActive = value;
	}

	public get IsPromotionActive(): boolean {
		return this._isPromotionActive;
	}

	public set IsPromotionActive(value: boolean) {
		this._isPromotionActive = value;
	}

	public get CompanyFlag(): boolean {
		return this._companyFlag;
	}

	public set CompanyFlag(value: boolean) {
		this._companyFlag = value;
	}

	public get IsOverPoolMin(): boolean {
		return this._isOverPoolMin;
	}

	public set IsOverPoolMin(value: boolean) {
		this._isOverPoolMin = value;
	}

	public get PoolSum(): string {
		return this._poolSum;
	}

	public set PoolSum(value: string) {
		this._poolSum = value;
	}

	public get PoolSumNumber(): number {
		return this._poolSumNumber;
	}

	public set PoolSumNumber(value: number) {
		this._poolSumNumber = value;
	}

	public get DeliveryEndTime(): string {
		return this._deliveryEndTime;
	}

	public set DeliveryEndTime(value: string) {
		this._deliveryEndTime = value;
	}

	public get IsTerminalActive(): boolean {
		return this._isTerminalActive;
	}

	public set IsTerminalActive(value: boolean) {
		this._isTerminalActive = value;
	}

	public get IsActiveForDelivery(): boolean {
		return this._isActiveForDelivery;
	}

	public set IsActiveForDelivery(value: boolean) {
		this._isActiveForDelivery = value;
	}

	public get IsActiveForPickup(): boolean {
		return this._isActiveForPickup;
	}

	public set IsActiveForPickup(value: boolean) {
		this._isActiveForPickup = value;
	}

	public get Bookmarked(): boolean {
		return this._bookmarked;
	}

	public set Bookmarked(value: boolean) {
		this._bookmarked = value;
	}

	public get NumberOfBookmarked(): number {
		return this._numberOfBookmarked;
	}

	public set NumberOfBookmarked(value: number) {
		this._numberOfBookmarked = value;
	}

	public get DiscountCouponPercent(): number {
		return this._discountCouponPercent;
	}

	public set DiscountCouponPercent(value: number) {
		this._discountCouponPercent = value;
	}

	public get CouponHasRestrictions(): boolean {
		return this._couponHasRestrictions;
	}

	public set CouponHasRestrictions(value: boolean) {
		this._couponHasRestrictions = value;
	}

	public get HasLogo(): boolean {
		return this._hasLogo;
	}

	public set HasLogo(value: boolean) {
		this._hasLogo = value;
	}

	public get ResWebsiteMode(): number {
		return this._resWebsiteMode;
	}

	public set ResWebsiteMode(value: number) {
		this._resWebsiteMode = value;
	}

	public get Priority(): number {
		return this._priority;
	}

	public set Priority(value: number) {
		this._priority = value;
	}

	public get KosherCertificateImgUrl(): string {
		return this._kosherCertificateImgUrl;
	}

	public set KosherCertificateImgUrl(value: string) {
		this._kosherCertificateImgUrl = value;
	}

	public get IsExpressRes(): boolean {
		return this._isExpressRes;
	}

	public set IsExpressRes(value: boolean) {
		this._isExpressRes = value;
	}

	public get ShowSEOTagsForRes(): boolean {
		return this._showSEOTagsForRes;
	}

	public set ShowSEOTagsForRes(value: boolean) {
		this._showSEOTagsForRes = value;
	}

	public get HappyHourResRulesDescription(): string[] {
		return this._happyHourResRulesDescription;
	}

	public set HappyHourResRulesDescription(value: string[]) {
		this._happyHourResRulesDescription = value;
	}

	public get PhoneOrdersOnlyOnPortals(): boolean {
		return this._phoneOrdersOnlyOnPortals;
	}

	public set PhoneOrdersOnlyOnPortals(value: boolean) {
		this._phoneOrdersOnlyOnPortals = value;
	}

	public get DeliveryStartTime(): string {
		return this._deliveryStartTime;
	}

	public set DeliveryStartTime(value: string) {
		this._deliveryStartTime = value;
	}

	public get PickupStartTime(): string {
		return this._pickupStartTime;
	}

	public set PickupStartTime(value: string) {
		this._pickupStartTime = value;
	}

	public get PickupEndTime(): string {
		return this._pickupEndTime;
	}

	public set PickupEndTime(value: string) {
		this._pickupEndTime = value;
    }

    }

    export class RestaurantBuilder {
        private _restaurantId: number;
        private _restaurantName: string;
        private _restaurantAddress: string;
        private _restaurantCityName: string;
        private _restaurantLogoUrl: string;
        private _restaurantPhone: string;
        private _restaurantCuisineList: string;
        private _numOfReviews: number;
        private _reviewsRank: number;
        private _distanceFromUser: string;
        private _distanceFromUserInMeters: number;
        private _isOpenForDelivery: boolean;
        private _isOpenForPickup: boolean;
        private _minimumOrder: string;
        private _minimumPriceForOrder: number;
        private _deliveryPrice: string;
        private _deliveryPriceForOrder: number;
        private _isKosher: string;
        private _restaurantKosher: string;
        private _deliveryRemarks: string;
        private _resGeoLocation_lon: number;
        private _resGeoLocation_lat: number;
        private _happyHourDiscount: string;
        private _happyHourDiscountPercent: number;
        private _deliveryChargeValueType: number;
        private _happyHourDiscountValidityString: string;
        private _startOrderURL: string;
        private _activityHours: string;
        private _pickupActivityHours: string;
        private _deliveryTime: string;
        private _arrivalDeliveryTime: string;
        private _estimatedDeliveryTime: string;
        private _arrivalEstimatedDeliveryTime: string;
        private _showEstimatedDeliveryTimes: boolean;
        private _isHappyHourActive: boolean;
        private _isPromotionActive: boolean;
        private _companyFlag: boolean;
        private _isOverPoolMin: boolean;
        private _poolSum: string;
        private _poolSumNumber: number;
        private _deliveryEndTime: string;
        private _isTerminalActive: boolean;
        private _isActiveForDelivery: boolean;
        private _isActiveForPickup: boolean;
        private _bookmarked: boolean;
        private _numberOfBookmarked: number;
        private _discountCouponPercent: number;
        private _couponHasRestrictions: boolean;
        private _hasLogo: boolean;
        private _resWebsiteMode: number;
        private _priority: number;
        private _kosherCertificateImgUrl: string;
        private _isExpressRes: boolean;
        private _showSEOTagsForRes: boolean;
        private _happyHourResRulesDescription: string[];
        private _phoneOrdersOnlyOnPortals: boolean;
        private _deliveryStartTime: string;
        private _pickupStartTime: string;
        private _pickupEndTime: string;

        setRestaurantId(value : number): RestaurantBuilder {
            this._restaurantId = value;
            return this;
        }

        setRestaurantName(value : string): RestaurantBuilder {
            this._restaurantName = value;
            return this;
        }
            setRestaurantAddress(value : string): RestaurantBuilder {
            this._restaurantAddress = value;
            return this;
        }
        setRestaurantCityName(value : string): RestaurantBuilder {
            this._restaurantCityName = value;
            return this;
        }
        setRestaurantLogoUrl(value : string): RestaurantBuilder {
            this._restaurantLogoUrl = value;
            return this;
        }
        setRestaurantPhone(value : string): RestaurantBuilder {
            this._restaurantPhone = value;
            return this;
        }
        setRestaurantCuisineList(value : string): RestaurantBuilder {
            this._restaurantCuisineList = value;
            return this;
        }

        setNumOfReviews(value : number): RestaurantBuilder {
            this._numOfReviews = value;
            return this;
        }
        setReviewsRank(value : number): RestaurantBuilder {
            this._reviewsRank = value;
            return this;
        }
        setDistanceFromUser(value : string): RestaurantBuilder {
            this._distanceFromUser = value;
            return this;
        }
        setDistanceFromUserInMeters(value : number): RestaurantBuilder {
            this._distanceFromUserInMeters = value;
            return this;
        }
        setIsOpenForDelivery(value : boolean): RestaurantBuilder {
            this._isOpenForDelivery = value;
            return this;
        }
        setIsOpenForPickup(value : boolean): RestaurantBuilder {
            this._isOpenForPickup = value;
            return this;
        }
        setMinimumOrder(value : string): RestaurantBuilder {
            this._minimumOrder = value;
            return this;
        }
        setMinimumPriceForOrder(value : number): RestaurantBuilder {
            this._minimumPriceForOrder = value;
            return this;
        }
        setDeliveryPrice(value : string): RestaurantBuilder {
            this._deliveryPrice = value;
            return this;
        }
        setDeliveryPriceForOrder(value : number): RestaurantBuilder {
            this._deliveryPriceForOrder = value;
            return this;
        }
        setIsKosher(value : string): RestaurantBuilder {
            this._isKosher = value;
            return this;
        }
        setRestaurantKosher(value : string): RestaurantBuilder {
            this._restaurantKosher = value;
            return this;
        }
        setDeliveryRemarks(value : string): RestaurantBuilder {
            this._deliveryRemarks = value;
            return this;
        }
        setResGeoLocation_lon(value : number): RestaurantBuilder {
            this._resGeoLocation_lon = value;
            return this;
        }
        setResGeoLocation_lat(value : number): RestaurantBuilder {
            this._resGeoLocation_lat = value;
            return this;
        }
        setHappyHourDiscount(value : string): RestaurantBuilder {
            this._happyHourDiscount = value;
            return this;
        }

        setHappyHourDiscountPercent(value : number): RestaurantBuilder {
            this._happyHourDiscountPercent = value;
            return this;
        }

        setDeliveryChargeValueType(value : number): RestaurantBuilder {
            this._deliveryChargeValueType = value;
            return this;
        }

        setHappyHourDiscountValidityString(value : string): RestaurantBuilder {
            this._happyHourDiscountValidityString = value;
            return this;
        }

        setStartOrderURL(value : string): RestaurantBuilder {
            this._startOrderURL = value;
            return this;
        }

        setActivityHours(value : string): RestaurantBuilder {
            this._activityHours = value;
            return this;
        }

        setPickupActivityHours(value : string): RestaurantBuilder {
            this._pickupActivityHours = value;
            return this;
        }

        setDeliveryTime(value : string): RestaurantBuilder {
            this._deliveryTime = value;
            return this;
        }

        setArrivalDeliveryTime(value : string): RestaurantBuilder {
            this._arrivalDeliveryTime = value;
            return this;
        }

        setEstimatedDeliveryTime(value : string): RestaurantBuilder {
            this._estimatedDeliveryTime = value;
            return this;
        }

        setArrivalEstimatedDeliveryTime(value : string): RestaurantBuilder {
            this._arrivalEstimatedDeliveryTime = value;
            return this;
        }

        setShowEstimatedDeliveryTimes(value : boolean): RestaurantBuilder {
            this._showEstimatedDeliveryTimes = value;
            return this;
        }

        setIsHappyHourActive(value : boolean): RestaurantBuilder {
            this._isHappyHourActive = value;
            return this;
        }

        setIsPromotionActive(value : boolean): RestaurantBuilder {
            this._isPromotionActive = value;
            return this;
        }

        setCompanyFlag(value : boolean): RestaurantBuilder {
            this._companyFlag = value;
            return this;
        }

        setIsOverPoolMin(value : boolean): RestaurantBuilder {
            this._isOverPoolMin = value;
            return this;
        }

        setPoolSum(value : string): RestaurantBuilder {
            this._poolSum = value;
            return this;
        }

        setPoolSumNumber(value : number): RestaurantBuilder {
            this._poolSumNumber = value;
            return this;
        }

        setDeliveryEndTime(value : string): RestaurantBuilder {
            this._deliveryEndTime = value;
            return this;
        }

        setIsTerminalActive(value : boolean): RestaurantBuilder {
            this._isTerminalActive = value;
            return this;
        }

        setIsActiveForDelivery(value : boolean): RestaurantBuilder {
            this._isActiveForDelivery = value;
            return this;
        }

        setIsActiveForPickup(value : boolean): RestaurantBuilder {
            this._isActiveForPickup = value;
            return this;
        }

        setBookmarked(value : boolean): RestaurantBuilder {
            this._bookmarked = value;
            return this;
        }

        setNumberOfBookmarked(value : number): RestaurantBuilder {
            this._numberOfBookmarked = value;
            return this;
        }

        setDiscountCouponPercent(value : number): RestaurantBuilder {
            this._discountCouponPercent = value;
            return this;
        }

        setCouponHasRestrictions(value : boolean): RestaurantBuilder {
            this._couponHasRestrictions = value;
            return this;
        }

        setHasLogo(value : boolean): RestaurantBuilder {
            this._hasLogo = value;
            return this;
        }

        setResWebsiteMode(value : number): RestaurantBuilder {
            this._resWebsiteMode = value;
            return this;
        }

        setPriority(value : number): RestaurantBuilder {
            this._priority = value;
            return this;
        }

        setKosherCertificateImgUrl(value : string): RestaurantBuilder {
            this._kosherCertificateImgUrl = value;
            return this;
        }

        setIsExpressRes(value : boolean): RestaurantBuilder {
            this._isExpressRes = value;
            return this;
        }

        setShowSEOTagsForRes(value : boolean): RestaurantBuilder {
            this._showSEOTagsForRes = value;
            return this;
        }

        setHappyHourResRulesDescription(value : string[]): RestaurantBuilder {
            this._happyHourResRulesDescription = value;
            return this;
        }

        setPhoneOrdersOnlyOnPortals(value : boolean): RestaurantBuilder {
            this._phoneOrdersOnlyOnPortals = value;
            return this;
        }

        setDeliveryStartTime(value : string): RestaurantBuilder {
            this._deliveryStartTime = value;
            return this;
        }

        setPickupStartTime(value : string): RestaurantBuilder {
            this._pickupStartTime = value;
            return this;
        }

        setPickupEndTime(value : string): RestaurantBuilder {
            this._pickupEndTime = value;
            return this;
        }

        build(): Restaurant {
            return new Restaurant(this);
        }


	public get RestaurantId(): number {
		return this._restaurantId;
	}

	public get RestaurantName(): string {
		return this._restaurantName;
	}

	public get RestaurantAddress(): string {
		return this._restaurantAddress;
	}

	public get RestaurantCityName(): string {
		return this._restaurantCityName;
	}

	public get RestaurantLogoUrl(): string {
		return this._restaurantLogoUrl;
	}

	public get RestaurantPhone(): string {
		return this._restaurantPhone;
	}

	public get RestaurantCuisineList(): string {
		return this._restaurantCuisineList;
	}

	public get NumOfReviews(): number {
		return this._numOfReviews;
	}

	public get DistanceFromUser(): string {
		return this._distanceFromUser;
	}

	public get DistanceFromUserInMeters(): number {
		return this._distanceFromUserInMeters;
	}

	public get IsOpenForDelivery(): boolean {
		return this._isOpenForDelivery;
	}

	public get IsOpenForPickup(): boolean {
		return this._isOpenForPickup;
	}

	public get MinimumOrder(): string {
		return this._minimumOrder;
	}

	public get MinimumPriceForOrder(): number {
		return this._minimumPriceForOrder;
	}

	public get DeliveryPrice(): string {
		return this._deliveryPrice;
	}

	public get DeliveryPriceForOrder(): number {
		return this._deliveryPriceForOrder;
	}

	public get IsKosher(): string {
		return this._isKosher;
	}

	public get RestaurantKosher(): string {
		return this._restaurantKosher;
	}

	public get DeliveryRemarks(): string {
		return this._deliveryRemarks;
	}

	public get ResGeoLocation_lon(): number {
		return this._resGeoLocation_lon;
	}

	public get ResGeoLocation_lat(): number {
		return this._resGeoLocation_lat;
	}

	public get HappyHourDiscount(): string {
		return this._happyHourDiscount;
	}

	public get HappyHourDiscountPercent(): number {
		return this._happyHourDiscountPercent;
	}

	public get DeliveryChargeValueType(): number {
		return this._deliveryChargeValueType;
	}

	public get HappyHourDiscountValidityString(): string {
		return this._happyHourDiscountValidityString;
	}

	public get StartOrderURL(): string {
		return this._startOrderURL;
	}

	public get ActivityHours(): string {
		return this._activityHours;
	}

	public get PickupActivityHours(): string {
		return this._pickupActivityHours;
	}

	public get DeliveryTime(): string {
		return this._deliveryTime;
	}

	public get ArrivalDeliveryTime(): string {
		return this._arrivalDeliveryTime;
	}

	public get EstimatedDeliveryTime(): string {
		return this._estimatedDeliveryTime;
	}

	public get ArrivalEstimatedDeliveryTime(): string {
		return this._arrivalEstimatedDeliveryTime;
	}

	public get ShowEstimatedDeliveryTimes(): boolean {
		return this._showEstimatedDeliveryTimes;
	}

	public get IsHappyHourActive(): boolean {
		return this._isHappyHourActive;
	}

	public get IsPromotionActive(): boolean {
		return this._isPromotionActive;
    }

	public get CompanyFlag(): boolean {
		return this._companyFlag;
	}

	public get IsOverPoolMin(): boolean {
		return this._isOverPoolMin;
	}

	public get PoolSum(): string {
		return this._poolSum;
	}

	public get PoolSumNumber(): number {
		return this._poolSumNumber;
	}

	public get DeliveryEndTime(): string {
		return this._deliveryEndTime;
	}

	public get IsTerminalActive(): boolean {
		return this._isTerminalActive;
	}

	public get IsActiveForDelivery(): boolean {
		return this._isActiveForDelivery;
	}

	public get IsActiveForPickup(): boolean {
		return this._isActiveForPickup;
	}

	public get Bookmarked(): boolean {
		return this._bookmarked;
	}


	public get NumberOfBookmarked(): number {
		return this._numberOfBookmarked;
	}

	public get DiscountCouponPercent(): number {
		return this._discountCouponPercent;
	}

	public get CouponHasRestrictions(): boolean {
		return this._couponHasRestrictions;
	}

	public get HasLogo(): boolean {
		return this._hasLogo;
	}

	public get ResWebsiteMode(): number {
		return this._resWebsiteMode;
	}

	public get Priority(): number {
		return this._priority;
	}

	public get KosherCertificateImgUrl(): string {
		return this._kosherCertificateImgUrl;
	}

	public get IsExpressRes(): boolean {
		return this._isExpressRes;
	}

	public get ShowSEOTagsForRes(): boolean {
		return this._showSEOTagsForRes;
	}

	public get HappyHourResRulesDescription(): string[] {
		return this._happyHourResRulesDescription;
	}

	public get PhoneOrdersOnlyOnPortals(): boolean {
		return this._phoneOrdersOnlyOnPortals;
	}

	public get DeliveryStartTime(): string {
		return this._deliveryStartTime;
	}

	public get PickupStartTime(): string {
		return this._pickupStartTime;
	}

	public get PickupEndTime(): string {
		return this._pickupEndTime;
	}


	public get ReviewsRank(): number {
		return this._reviewsRank;
	}

    }
    export interface MessageFormatter {
        getDefaultResponse() : Commons.TenBisResponse;
        getErrorMessage(restaurantName : string) : Commons.TenBisResponse;
        getRestaurantName(req : Commons.Request) : string;
        generateSearchResponse(restaurants : Commons.Restaurant[]) : Commons.TenBisResponse;
        generateTotalOrdersResponse(restaurants : Commons.Restaurant[]) : Commons.TenBisResponse;
        isValidMessage(req : Commons.Request) : boolean;
    }

    export interface Request extends Express.Request {
        body: any;
    }

    export interface TenBisResponse {
    }
}
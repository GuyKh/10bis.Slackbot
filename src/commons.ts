export module Commons {
    export class Restaurant {
        RestaurantId: number;
        RestaurantName: string;
        RestaurantAddress: string;
        RestaurantCityName: string;
        RestaurantLogoUrl: string;
        RestaurantPhone: string;
        RestaurantCuisineList: string;
        NumOfReviews: string;
        ReviewsRank: number;
        distanceFromUser: string;
        distanceFromUserInMeters: number;
        IsOpenForDelivery: boolean;
        IsOpenForPickup: boolean;
        MinimumOrder: string;
        MinimumPriceForOrder: number;
        DeliveryPrice: string;
        DeliveryPriceForOrder: number;
        IsKosher: string;
        RestaurantKosher: string;
        DeliveryRemarks: string;
        ResGeoLocation_lon: string;
        ResGeoLocation_lat: string;
        HappyHourDiscount: number;
        HappyHourDiscountPercent: number;
        deliveryChargeValueType: number;
        HappyHourDiscountValidityString: number;
        StartOrderURL: string;
        ActivityHours: string;
        PickupActivityHours: string;
        DeliveryTime: string;
        ArrivalDeliveryTime: string;
        EstimatedDeliveryTime: string;
        ArrivalEstimatedDeliveryTime: string;
        ShowEstimatedDeliveryTimes: boolean;
        IsHappyHourActive: boolean;
        IsPromotionActive: boolean;
        CompanyFlag: boolean;
        IsOverPoolMin: boolean;
        PoolSum: string;
        PoolSumNumber: number;
        DeliveryEndTime: string;
        IsTerminalActive: boolean;
        IsActiveForDelivery: boolean;
        IsActiveForPickup: boolean;
        Bookmarked: boolean;
        NumberOfBookmarked: number;
        DiscountCouponPercent: number;
        CouponHasRestrictions: boolean;
        HasLogo: boolean;
        ResWebsiteMode: number;
        Priority: number;
        KosherCertificateImgUrl: string;
        IsExpressRes: boolean;
        ShowSEOTagsForRes: boolean;
        HappyHourResRulesDescription: string[];
        PhoneOrdersOnlyOnPortals: boolean;
        DeliveryStartTime: string;
        PickupStartTime: string;
        PickupEndTime: string;
    }

    export interface MessageFormatter {
        getSuccessMessage(defaultResponse : string, tt : string) : string;
        getErrorMessage() : string;
        getErrorMessage(restaurantName : string) : string;
        getRestaurantName(req : Commons.Request) : string;
        generateSearchResponse(restaurants : Commons.Restaurant[]) : string;
        generateTotalOrdersResponse(restaurants : Commons.Restaurant[]) : string;
        isValidMessage(req : Commons.Request) : boolean;
    }

    export interface Request extends Express.Request {
        body: any;
    }

    export interface Response extends Express.Response {
        statusCode: number;
        status(num : number) : void;
        send(body: string) : void;
    }

    export interface TenBisResponse {
    }
}
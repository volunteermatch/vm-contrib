package org.vm.sample.search;

import java.util.ArrayList;

/**
 * Class to represent the oppotunites search query passed to the "searchOpportunities" API call. This class is
 * converted to a JSON string and then passed as input to the API call.
 *
 * Limitations: Currently not all possible fields are represented here. Only the ones currently needed
 * by the simple SearchOpportunitiesExample example.
 *
 * Created by jrackwitz on 12/3/15.
 */
public class OppSearchQuery {
  private String location;
  private boolean virtual;
  private String radius;
  private ArrayList<DateRange> dateRanges;
  private String sortOrder;
  private String sortCriteria;
  private String updatedSince;
  private boolean includeInactive;

  public boolean isIncludeInactive() {
    return includeInactive;
  }

  public void setIncludeInactive(boolean includeInactive) {
    this.includeInactive = includeInactive;
  }

  public String getUpdatedSince() {
    return updatedSince;
  }

  public void setUpdatedSince(String updatedSince) {
    this.updatedSince = updatedSince;
  }

  public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public boolean isVirtual() {
    return virtual;
  }

  public void setVirtual(boolean virtual) {
    this.virtual = virtual;
  }

  public String getRadius() {
    return radius;
  }

  public void setRadius(String radius) {
    this.radius = radius;
  }

  public ArrayList<DateRange> getDateRanges() {
    return dateRanges;
  }

  public void setDateRanges(ArrayList<DateRange> dateRanges) {
    this.dateRanges = dateRanges;
  }

  public String getSortOrder() {
    return sortOrder;
  }

  public void setSortOrder(String sortOrder) {
    this.sortOrder = sortOrder;
  }

  public String getSortCriteria() {
    return sortCriteria;
  }

  public void setSortCriteria(String sortCriteria) {
    this.sortCriteria = sortCriteria;
  }

  public Integer getPageNumber() {
    return pageNumber;
  }

  public void setPageNumber(Integer pageNumber) {
    this.pageNumber = pageNumber;
  }

  public ArrayList<String> getFieldsToDisplay() {
    return fieldsToDisplay;
  }

  public void setFieldsToDisplay(ArrayList<String> fieldsToDisplay) {
    this.fieldsToDisplay = fieldsToDisplay;
  }

  Integer pageNumber = 1;
  ArrayList<String> fieldsToDisplay;

  public static class DateRange {
    private Boolean singleDayOpps;
    private String startDate;
    private String endDate;
    private Boolean ongoing;

    public Boolean getSingleDayOpps() {
      return singleDayOpps;
    }

    public void setSingleDayOpps(Boolean singleDayOpps) {
      this.singleDayOpps = singleDayOpps;
    }

    public String getStartDate() {
      return startDate;
    }

    public void setStartDate(String startDate) {
      this.startDate = startDate;
    }

    public String getEndDate() {
      return endDate;
    }

    public void setEndDate(String endDate) {
      this.endDate = endDate;
    }

    public Boolean getOngoing() {
      return ongoing;
    }

    public void setOngoing(Boolean ongoing) {
      this.ongoing = ongoing;
    }
  }
}

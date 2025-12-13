/*{
      "text": "INDIA/STATE",
      "x0": 482.34484,
      "x1": 514.1144800000001,
      "top": 119.44999999999999,
      "bottom": 125.33000000000004,
      "y_center": 122.39000000000001,
      "page": 1
    }
      
    {
              "text": "ADMITTED",
              "x0": 542.47,
              "x1": 568.8300399999999,
              "top": 107.92999999999995,
              "bottom": 113.81,
              "y_center": 110.86999999999998,
              "page": 1
        }
    {
            "text": "COURSE",
            "x0": 542.47,
            "x1": 562.3738000000001,
            "top": 115.60999999999996,
            "bottom": 121.49000000000001,
            "y_center": 118.54999999999998,
            "page": 1
        }
        {
              "text": "ADMITTED",
              "x0": 600.1,
              "x1": 626.4600399999999,
              "top": 111.76999999999998,
              "bottom": 117.65000000000003,
              "y_center": 114.71000000000001,
              "page": 1
            }
        {
          "text": "COLLEGE",
          "x0": 600.1,
          "x1": 621.6972400000001,
          "top": 119.44999999999999,
          "bottom": 125.33000000000004,
          "y_center": 122.39000000000001,
          "page": 1
    }
    {
          "text": "ADMITTED",
          "x0": 650.5,
          "x1": 676.8600399999999,
          "top": 111.76999999999998,
          "bottom": 117.65000000000003,
          "y_center": 114.71000000000001,
          "page": 1
        }
    {
          "text": "SUBJECT",
          "x0": 650.5,
          "x1": 671.16232,
          "top": 119.44999999999999,
          "bottom": 125.33000000000004,
          "y_center": 122.39000000000001,
          "page": 1
        }

    
        {
              "text": "ADMITTED",
              "x0": 700.92,
              "x1": 727.2800399999999,
              "top": 111.76999999999998,
              "bottom": 117.65000000000003,
              "y_center": 114.71000000000001,
              "page": 1
            }
        {
          "text": "CATEGORY",
          "x0": 700.92,
          "x1": 727.4858399999999,
          "top": 119.44999999999999,
          "bottom": 125.33000000000004,
          "y_center": 122.39000000000001,
          "page": 1
    }

    
    {
          "text": "ADMITTED",
          "x0": 735.12,
          "x1": 761.4800399999999,
          "top": 111.76999999999998,
          "bottom": 117.65000000000003,
          "y_center": 114.71000000000001,
          "page": 1
        }
    {
          "text": "ROUND",
          "x0": 735.12,
          "x1": 753.8184,
          "top": 119.44999999999999,
          "bottom": 125.33000000000004,
          "y_center": 122.39000000000001,
          "page": 1
    }



      {
      "text": "MKCG",
      "x0": 600.1,
      "x1": 614.9822800000001,
      "top": 156.76999999999998,
      "bottom": 162.65000000000003,
      "y_center": 159.71,
      "page": 1
    }
    {
      "text": "MCH",
      "x0": 616.31116,
      "x1": 628.13584,
      "top": 156.76999999999998,
      "bottom": 162.65000000000003,
      "y_center": 159.71,
      "page": 1
    }
     {
          "text": "BERHAMPUR",
          "x0": 600.1,
          "x1": 631.4756800000001,
          "top": 164.45,
          "bottom": 170.33000000000004,
          "y_center": 167.39000000000001,
          "page": 1
      }


*/

/*
column headers -x0 & x1 are same , some tokens under these columns have either same x0 or x1

columns needed from the data -
admission_status, admitted_course, admitted_college, admitted_subject

ranges of these columns -

PATTERNS OF COLUMN HEADERS-

admission_status_india_state = all coordinates are same(x0,x1,top,bottom,y_center) except 1st page (only x0,x1)
admitted_course = same as admission_status_india_state  
admitted_college = same as admission_status_india_state
admitted_subject = same as admission_status_india_state

*same number in each page and same number across all pages

ADMISSION STATUS ALL INDIA/STATE = same top and bottom for (ADMISSION AND STATUS) , (ALL and INDIA/STATE)

ADMITTED COURSE => (equal x0 of both ADMITTED and COURSE)

ADMITTED COLLEGE => (equal x0 of both ADMITTED and COLLEGE)

ADMITTED SUBJECT => (equal x0 of both ADMITTED and SUBJECT)

PATTERN OF DATA BELOW THESE HEADERS-
DATA UNDER =>

ADMISSION STATUS ALL INDIA/STATE => (x0 different for indiv words but same for each word across all rows)
ADMISSION - ("x0": 472.39, "x1": 501.33135999999996)
STATUS - ("x0": 502.62496, "x1": 521.3527)
ALL - ("x0": 472.39, "x1": 480.98656)
INDIA/STATE - ("x0": 482.34484,"x1": 514.1144800000001)

1. ALL ("x0": 472.39, "x1": 480.73372)
INDIA ("x0": 482.10964, "x1": 495.81591999999995) 
ADM - ("x0": 497.09776, "x1": 509.09296,)
Range - 472 - 520

PG- ("x0": 472.39,"x1": 479.09908)
MEDICAL- ("x0": 480.42796,"x1": 502.33096)
ODISHA- ("x0": 503.70687999999996,"x1": 522.45232)


ADMITTED COURSE =>
ADMITTED - ("x0": 542.47, "x1": 568.8300399999999)
COURSE - ("x0": 542.47, "x1": 562.3738000000001)

PG- ("x0": 542.47, "x1": 549.17908)
MEDICAL - ("x0": 550.50796, "x1": 572.41096)
ODISHA- ("x0": 573.78688, "x1": 592.53232)

PMN-("x0": 542.47,"x1": 554.2946800000001)
DIPLOMA -("x0": 555.6706, "x1": 578.4908800000001)

rANGE - 540-595

ADMITTED COLLEGE =>
ADMITTED - ("x0": 600.1,"x1": 626.4600399999999)
COLLEGE - ("x0": 600.1,"x1": 621.6972400000001 )

SCB- ("x0": 600.1,"x1": 609.1846,)
MCH- ("x0": 610.537,"x1": 622.36168,)
CUTTACK-("x0": 623.73172,"x1": 645.48772)
Range- 600-647

ADMITTED SUBJECT =>
ADMITTED - ("x0": 650.5,"x1": 676.8600399999999)
SUBJECT - ("x0": 650.5,"x1": 671.16232)

ANAESTHESIOLOGY - ("x0": 650.5,"x1": 697.11664)
Range- 650-698

ADMITTED CATEGORY-
ADMITTED - ("x0": 700.92,"x1": 727.2800399999999)
CATEGORY - ("x0": 700.92,"x1": 727.4858399999999)

Range- 700-730
*/


